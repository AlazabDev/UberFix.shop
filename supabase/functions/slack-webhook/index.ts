// supabase/functions/slack-webhook/index.ts
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { SlackClient } from '../../../src/lib/slack/slackClient.ts';

const SLACK_WEBHOOK = Deno.env.get('SLACK_WEBHOOK_URL');
const SLACK_SIGNING_SECRET = Deno.env.get('SLACK_SIGNING_SECRET');

const slackClient = new SlackClient(SLACK_WEBHOOK, SLACK_SIGNING_SECRET);

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Not allowed', { status: 405 });

  const timestamp = req.headers.get('X-Slack-Request-Timestamp') || '';
  const signature = req.headers.get('X-Slack-Signature') || '';
  const body = await req.text();

  // معالجة الـ webhook
  const result = await slackClient.handleWebhook(timestamp, signature, body);

  if (!result.success) {
    return new Response(JSON.stringify(result), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // معالجة الـ events
  if (result.type === 'url_verification') {
    return new Response(JSON.stringify({ challenge: result.data.challenge }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
