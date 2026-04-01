// supabase/functions/slack-webhook/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SlackCallbackManager } from "../../../src/lib/slack/callbackManager.ts";

serve(async (req) => {
  const body = await req.text();
  const payload = JSON.parse(body);

  // معالجة actions
  if (payload.type === 'block_actions') {
    const action = payload.actions[0];
    const callbackId = payload.view?.id || payload.callback_id;

    // استخراج الـ Callback ID من action_id
    const cbIdMatch = action.action_id.match(/(approve|reject)_([a-f0-9-]+)/);
    if (cbIdMatch) {
      const [_, actionType, extractedCallbackId] = cbIdMatch;

      // معالجة الـ Callback
      const result = await SlackCallbackManager.executeCallback(
        extractedCallbackId,
        async (callback) => {
          return {
            action: actionType,
            userId: payload.user.id,
            timestamp: new Date().toISOString(),
          };
        }
      );

      return new Response(
        JSON.stringify({ ok: result.success }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
