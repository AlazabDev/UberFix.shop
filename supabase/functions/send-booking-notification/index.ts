import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  full_name: string;
  email: string;
  phone: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  booking_id: string;
}

const serviceTypeLabels: Record<string, string> = {
  'maintenance': 'صيانة عامة',
  'ac': 'تكييف وتبريد',
  'electrical': 'كهرباء',
  'plumbing': 'سباكة',
  'consulting': 'استشارة فنية',
  'inspection': 'فحص ومعاينة',
  'other': 'أخرى',
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received booking notification request");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingRequest = await req.json();
    console.log("Booking data:", JSON.stringify(booking, null, 2));

    const serviceName = serviceTypeLabels[booking.service_type] || booking.service_type;
    
    // Send email to admin
    console.log("Sending email to admin...");
    const emailResponse = await resend.emails.send({
      from: "UberFix <onboarding@resend.dev>",
      to: ["admin@alazab.com"],
      subject: `📅 طلب حجز استشارة جديد - ${booking.full_name}`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1a4b8c 0%, #0b1e36 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .info-row { display: flex; padding: 15px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: bold; color: #666; width: 140px; flex-shrink: 0; }
            .info-value { color: #333; }
            .message-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px; border-right: 4px solid #f5bf23; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .badge { display: inline-block; background: #f5bf23; color: #1a4b8c; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔧 طلب حجز استشارة جديد</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">UberFix - إدارة المنشآت والصيانة</p>
            </div>
            <div class="content">
              <div style="text-align: center; margin-bottom: 20px;">
                <span class="badge">${serviceName}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">👤 الاسم:</span>
                <span class="info-value">${booking.full_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📧 البريد:</span>
                <span class="info-value">${booking.email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📱 الهاتف:</span>
                <span class="info-value">${booking.phone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 التاريخ:</span>
                <span class="info-value">${booking.preferred_date}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🕐 الوقت:</span>
                <span class="info-value">${booking.preferred_time}</span>
              </div>
              
              ${booking.message ? `
                <div class="message-box">
                  <strong>💬 الرسالة:</strong>
                  <p style="margin: 10px 0 0 0;">${booking.message}</p>
                </div>
              ` : ''}
              
              <div style="margin-top: 25px; text-align: center;">
                <p style="color: #666;">رقم الحجز: <strong>${booking.booking_id}</strong></p>
              </div>
            </div>
            <div class="footer">
              <p>تم استلام هذا الطلب عبر موقع UberFix</p>
              <p>© ${new Date().getFullYear()} UberFix - جميع الحقوق محفوظة</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent:", JSON.stringify(emailResponse));

    // Send WhatsApp notification
    let whatsappResult = { success: false, message: "WhatsApp not configured" };
    
    if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
      console.log("Sending WhatsApp notification...");
      
      const whatsappMessage = `🔔 *طلب حجز استشارة جديد*

👤 *الاسم:* ${booking.full_name}
📧 *البريد:* ${booking.email}
📱 *الهاتف:* ${booking.phone}
🔧 *الخدمة:* ${serviceName}
📅 *التاريخ:* ${booking.preferred_date}
🕐 *الوقت:* ${booking.preferred_time}
${booking.message ? `\n💬 *الرسالة:* ${booking.message}` : ''}

📋 *رقم الحجز:* ${booking.booking_id}`;

      try {
        const whatsappResponse = await fetch(
          `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: "201004006620",
              type: "text",
              text: { body: whatsappMessage },
            }),
          }
        );

        const whatsappData = await whatsappResponse.json();
        console.log("WhatsApp response:", JSON.stringify(whatsappData));
        
        whatsappResult = {
          success: whatsappResponse.ok,
          message: whatsappResponse.ok ? "WhatsApp sent successfully" : whatsappData.error?.message || "Failed",
        };
      } catch (whatsappError) {
        console.error("WhatsApp error:", whatsappError);
        whatsappResult = { success: false, message: String(whatsappError) };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        email: emailResponse,
        whatsapp: whatsappResult,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
