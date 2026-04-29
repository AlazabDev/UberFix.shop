import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { openApiSpec } from '@/lib/api-gateway/openapi-spec';
import { ChevronDown, Copy, Download, FileJson, Play, Lock, Globe } from 'lucide-react';

const METHOD_COLORS: Record<string, string> = {
  get: 'bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-300',
  post: 'bg-green-500/10 text-green-700 border-green-300 dark:text-green-300',
  patch: 'bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-300',
  put: 'bg-orange-500/10 text-orange-700 border-orange-300 dark:text-orange-300',
  delete: 'bg-red-500/10 text-red-700 border-red-300 dark:text-red-300',
};

type Op = {
  path: string;
  method: string;
  op: any;
};

function resolveRef(spec: any, ref: string): any {
  const parts = ref.replace('#/', '').split('/');
  return parts.reduce((acc, k) => acc?.[k], spec);
}

function exampleFromSchema(spec: any, schema: any): any {
  if (!schema) return null;
  if (schema.$ref) return exampleFromSchema(spec, resolveRef(spec, schema.$ref));
  if (schema.example !== undefined) return schema.example;
  if (schema.type === 'object' && schema.properties) {
    const out: any = {};
    for (const [k, v] of Object.entries<any>(schema.properties)) {
      out[k] = exampleFromSchema(spec, v);
    }
    return out;
  }
  if (schema.type === 'array') return [exampleFromSchema(spec, schema.items)];
  if (schema.enum) return schema.enum[0];
  if (schema.default !== undefined) return schema.default;
  switch (schema.type) {
    case 'string': return schema.format === 'uuid' ? '00000000-0000-0000-0000-000000000000' : 'string';
    case 'integer':
    case 'number': return 0;
    case 'boolean': return false;
    default: return null;
  }
}

function curlFor(serverUrl: string, op: Op, body: string, headers: Record<string, string>): string {
  const lines = [`curl -X ${op.method.toUpperCase()} "${serverUrl}${op.path}"`];
  for (const [k, v] of Object.entries(headers)) {
    if (v) lines.push(`  -H "${k}: ${v}"`);
  }
  if (body && op.method !== 'get') lines.push(`  -d '${body}'`);
  return lines.join(' \\\n');
}

function EndpointCard({ op, serverUrl, sharedAuth }: { op: Op; serverUrl: string; sharedAuth: { apiKey: string; bearer: string } }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<{ status: number; body: string; ms: number } | null>(null);

  const requestExample = useMemo(() => {
    const schema = op.op.requestBody?.content?.['application/json']?.schema;
    if (!schema) return '';
    return JSON.stringify(exampleFromSchema(openApiSpec, schema), null, 2);
  }, [op]);

  const [body, setBody] = useState(requestExample);
  const [pathParams, setPathParams] = useState<Record<string, string>>({});

  const responseExamples = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [code, resp] of Object.entries<any>(op.op.responses ?? {})) {
      const schema = resp.content?.['application/json']?.schema;
      if (schema) out[code] = JSON.stringify(exampleFromSchema(openApiSpec, schema), null, 2);
    }
    return out;
  }, [op]);

  const requiresAuth = (op.op.security?.length ?? 1) > 0;

  async function tryIt() {
    setRunning(true);
    setResponse(null);
    try {
      let url = serverUrl + op.path;
      for (const [k, v] of Object.entries(pathParams)) {
        url = url.replace(`{${k}}`, encodeURIComponent(v || ''));
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sharedAuth.bearer) headers['Authorization'] = `Bearer ${sharedAuth.bearer}`;
      if (sharedAuth.apiKey) headers['X-API-Key'] = sharedAuth.apiKey;
      if (op.op.parameters?.some((p: any) => p.name === 'Idempotency-Key' || p.$ref?.endsWith('/IdempotencyKey'))) {
        headers['Idempotency-Key'] = crypto.randomUUID();
      }
      const t0 = performance.now();
      const res = await fetch(url, {
        method: op.method.toUpperCase(),
        headers,
        body: op.method === 'get' ? undefined : body,
      });
      const text = await res.text();
      let pretty = text;
      try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch { /* keep raw */ }
      setResponse({ status: res.status, body: pretty, ms: Math.round(performance.now() - t0) });
    } catch (e) {
      setResponse({ status: 0, body: (e as Error).message, ms: 0 });
    } finally {
      setRunning(false);
    }
  }

  const pathParamDefs = (op.op.parameters ?? [])
    .map((p: any) => p.$ref ? resolveRef(openApiSpec, p.$ref) : p)
    .filter((p: any) => p.in === 'path');

  const allHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(sharedAuth.bearer ? { Authorization: `Bearer ${sharedAuth.bearer}` } : {}),
    ...(sharedAuth.apiKey ? { 'X-API-Key': sharedAuth.apiKey } : {}),
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-lg overflow-hidden">
      <CollapsibleTrigger className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition" dir="ltr">
        <Badge variant="outline" className={`uppercase font-mono text-xs ${METHOD_COLORS[op.method]}`}>
          {op.method}
        </Badge>
        <code className="text-sm font-mono flex-1 text-left">{op.path}</code>
        <span className="text-xs text-muted-foreground hidden sm:inline">{op.op.summary}</span>
        {requiresAuth ? <Lock className="h-3 w-3 text-muted-foreground" /> : <Globe className="h-3 w-3 text-muted-foreground" />}
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t bg-muted/20">
        <div className="p-4 space-y-4">
          {op.op.description && <p className="text-sm text-muted-foreground">{op.op.description}</p>}

          {pathParamDefs.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Path Parameters</Label>
              {pathParamDefs.map((p: any) => (
                <div key={p.name} className="flex items-center gap-2">
                  <code className="text-xs w-32">{p.name}</code>
                  <Input
                    placeholder={p.schema?.example ?? p.name}
                    value={pathParams[p.name] ?? ''}
                    onChange={(e) => setPathParams({ ...pathParams, [p.name]: e.target.value })}
                    dir="ltr"
                  />
                </div>
              ))}
            </div>
          )}

          {requestExample && (
            <div>
              <Label className="text-xs">Request Body</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={Math.min(12, body.split('\n').length + 1)}
                className="font-mono text-xs mt-1"
                dir="ltr"
              />
            </div>
          )}

          <Tabs defaultValue="curl">
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
              <TabsTrigger value="try">Try it</TabsTrigger>
            </TabsList>

            <TabsContent value="curl" className="mt-2">
              <div className="relative">
                <pre className="bg-background border rounded p-3 text-xs overflow-x-auto" dir="ltr">
                  <code>{curlFor(serverUrl, op, body, allHeaders)}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 left-1"
                  onClick={() => {
                    navigator.clipboard.writeText(curlFor(serverUrl, op, body, allHeaders));
                    toast({ title: 'تم النسخ' });
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="responses" className="mt-2 space-y-2">
              {Object.entries<any>(op.op.responses ?? {}).map(([code, resp]) => (
                <div key={code} className="border rounded">
                  <div className="flex items-center gap-2 p-2 border-b bg-background">
                    <Badge variant={code.startsWith('2') ? 'default' : 'destructive'}>{code}</Badge>
                    <span className="text-xs text-muted-foreground">{resp.description}</span>
                  </div>
                  {responseExamples[code] && (
                    <pre className="p-3 text-xs overflow-x-auto bg-background" dir="ltr">
                      <code>{responseExamples[code]}</code>
                    </pre>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="try" className="mt-2 space-y-2">
              <Button onClick={tryIt} disabled={running} size="sm" className="gap-2">
                <Play className="h-3 w-3" />
                {running ? 'جاري التنفيذ...' : 'تنفيذ'}
              </Button>
              {!sharedAuth.apiKey && !sharedAuth.bearer && requiresAuth && (
                <p className="text-xs text-amber-600">⚠ هذا المسار يحتاج مصادقة. أضف API Key أو Bearer token من الأعلى.</p>
              )}
              {response && (
                <div className="border rounded mt-2">
                  <div className="flex items-center gap-2 p-2 border-b bg-background">
                    <Badge variant={response.status >= 200 && response.status < 300 ? 'default' : 'destructive'}>
                      {response.status || 'ERROR'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{response.ms}ms</span>
                  </div>
                  <pre className="p-3 text-xs overflow-x-auto bg-background max-h-80" dir="ltr">
                    <code>{response.body}</code>
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function OpenApiPanel() {
  const { toast } = useToast();
  const [serverUrl, setServerUrl] = useState(openApiSpec.servers[0].url);
  const [apiKey, setApiKey] = useState('');
  const [bearer, setBearer] = useState('');

  const operationsByTag = useMemo(() => {
    const out: Record<string, Op[]> = {};
    for (const [path, item] of Object.entries<any>(openApiSpec.paths)) {
      for (const method of ['get', 'post', 'patch', 'put', 'delete']) {
        const op = item[method];
        if (!op) continue;
        const tag = op.tags?.[0] ?? 'Default';
        (out[tag] ??= []).push({ path, method, op });
      }
    }
    return out;
  }, []);

  function downloadSpec() {
    const blob = new Blob([JSON.stringify(openApiSpec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uberfix-openapi.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'تم تنزيل openapi.json' });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              {openApiSpec.info.title}
              <Badge variant="outline">v{openApiSpec.info.version}</Badge>
            </CardTitle>
            <CardDescription>{openApiSpec.info.description}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={downloadSpec} className="gap-2">
            <Download className="h-4 w-4" />
            openapi.json
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg border">
          <div>
            <Label className="text-xs">Server</Label>
            <select
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="w-full mt-1 h-9 rounded-md border bg-background px-2 text-xs"
              dir="ltr"
            >
              {openApiSpec.servers.map((s) => (
                <option key={s.url} value={s.url}>{s.description}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">X-API-Key</Label>
            <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="uf_..." dir="ltr" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Bearer Token</Label>
            <Input value={bearer} onChange={(e) => setBearer(e.target.value)} placeholder="eyJhbGc..." dir="ltr" className="mt-1" />
          </div>
        </div>

        {Object.entries(operationsByTag).map(([tag, ops]) => (
          <div key={tag} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">{tag}</h3>
            <div className="space-y-2">
              {ops.map((op) => (
                <EndpointCard key={`${op.method}:${op.path}`} op={op} serverUrl={serverUrl} sharedAuth={{ apiKey, bearer }} />
              ))}
            </div>
          </div>
        ))}

        <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
          <h3 className="font-semibold text-sm">📡 Webhook Events</h3>
          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(openApiSpec['x-webhook-events']).map(([evt, desc]) => (
              <div key={evt} className="flex items-center gap-2 p-2 bg-background rounded border">
                <code className="text-primary">{evt}</code>
                <span className="text-muted-foreground">— {desc}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}