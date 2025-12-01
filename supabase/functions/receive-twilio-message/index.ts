import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TwilioIncomingMessage {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
  ProfileName?: string;
  WaId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse form data from Twilio webhook
    const formData = await req.formData();
    const data: TwilioIncomingMessage = {
      MessageSid: formData.get('MessageSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      Body: formData.get('Body') as string,
      NumMedia: formData.get('NumMedia') as string,
      MediaUrl0: formData.get('MediaUrl0') as string,
      MediaContentType0: formData.get('MediaContentType0') as string,
      ProfileName: formData.get('ProfileName') as string,
      WaId: formData.get('WaId') as string,
    };

    console.log('Incoming message received:', {
      sid: data.MessageSid,
      from: data.From,
      to: data.To,
      hasMedia: data.NumMedia && parseInt(data.NumMedia) > 0,
    });

    // Determine message type
    const messageType = data.From.includes('whatsapp:') ? 'whatsapp' : 'sms';
    const cleanFrom = data.From.replace('whatsapp:', '');
    const cleanTo = data.To.replace('whatsapp:', '');

    // Store incoming message in message_logs
    const { data: messageLog, error: logError } = await supabase
      .from('message_logs')
      .insert({
        external_id: data.MessageSid,
        recipient: cleanTo, // Our number (recipient of the incoming message)
        message_content: data.Body || '[Media Message]',
        message_type: messageType,
        provider: 'twilio',
        status: 'received',
        sent_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
        metadata: {
          from: cleanFrom,
          to: cleanTo,
          direction: 'incoming',
          profileName: data.ProfileName,
          waId: data.WaId,
          hasMedia: data.NumMedia && parseInt(data.NumMedia) > 0,
          mediaUrl: data.MediaUrl0,
          mediaType: data.MediaContentType0,
        },
      })
      .select()
      .single();

    if (logError) {
      console.error('Error storing incoming message:', logError);
      throw logError;
    }

    console.log('Incoming message stored successfully:', messageLog.id);

    // Find or create notification for staff about new incoming message
    // First, try to find related maintenance request by phone number
    const { data: relatedRequest } = await supabase
      .from('maintenance_requests')
      .select('id, title, created_by')
      .or(`client_phone.eq.${cleanFrom},client_phone.ilike.%${cleanFrom.slice(-10)}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get admin and manager users to notify
    const { data: staffUsers } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'manager', 'staff']);

    if (staffUsers && staffUsers.length > 0) {
      const notifications = staffUsers.map(staff => ({
        recipient_id: staff.user_id,
        title: `رسالة ${messageType === 'whatsapp' ? 'واتساب' : 'SMS'} واردة`,
        message: `من: ${data.ProfileName || cleanFrom}\nالرسالة: ${data.Body || '[رسالة وسائط]'}`,
        type: 'info',
        entity_type: 'message',
        entity_id: relatedRequest?.id,
        message_log_id: messageLog.id,
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error creating notifications:', notifError);
      } else {
        console.log('Staff notifications created:', notifications.length);
      }
    }

    // Respond to Twilio with TwiML (empty response = no auto-reply)
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>شكراً لتواصلك معنا. سيتم الرد عليك في أقرب وقت.</Message>
</Response>`;

    return new Response(twimlResponse, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error processing incoming message:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process incoming message',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
