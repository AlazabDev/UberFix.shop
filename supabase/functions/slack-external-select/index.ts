// supabase/functions/slack-external-select/index.ts
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { SlackClient } from '../../../src/lib/slack/slackClient.ts';
import type { ExternalSelectResponse } from '../../../src/lib/slack/types.ts';

const slackClient = new SlackClient(
  Deno.env.get('SLACK_WEBHOOK_URL'),
  Deno.env.get('SLACK_SIGNING_SECRET')
);

serve(async (req) => {
  const payload = await req.json();
  const query = payload.value || '';

  // البحث في قاعدة البيانات أو API خارجية
  const options = await searchOptions(query);

  const response: ExternalSelectResponse = {
    options: options.map((opt) => ({
      text: { type: 'plain_text' as const, text: opt.label },
      value: opt.id,
    })),
  };

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  });
});

async function searchOptions(query: string) {
  // تنفيذ البحث هنا
  return [
    { id: '1', label: `Result for "${query}"` },
  ];
}
