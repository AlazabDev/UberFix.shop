import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  recipient_email: string;
  recipient_name: string;
  notification_type: 'request_created' | 'status_update' | 'vendor_assigned' | 'request_completed';
  request_id: string;
  request_title: string;
  request_status?: string;
  vendor_name?: string;
  notes?: string;
}

const generateNotificationHTML = (data: EmailNotificationRequest): string => {
  const { notification_type, recipient_name, request_title, request_status, vendor_name, notes } = data;
  
  let subject = '';
  let mainMessage = '';
  
  switch (notification_type) {
    case 'request_created':
      subject = 'تم استلام طلب الصيانة';
      mainMessage = `
        <h2 style="color: #f5bf23; margin-bottom: 20px;">شكراً لك ${recipient_name}</h2>
        <p style="font-size: 16px; color: #333;">تم استلام طلب الصيانة الخاص بك بنجاح:</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0; border-right: 4px solid #f5bf23;">
          <h3 style="color: #111; margin: 0 0 10px 0;">${request_title}</h3>
          <p style="color: #666; margin: 0;">سيتم التواصل معك قريباً من قبل أحد الفنيين المتخصصين</p>
        </div>
      `;
      break;
      
    case 'status_update':
      subject = 'تحديث حالة طلب الصيانة';
      mainMessage = `
        <h2 style="color: #f5bf23; margin-bottom: 20px;">مرحباً ${recipient_name}</h2>
        <p style="font-size: 16px; color: #333;">تم تحديث حالة طلب الصيانة:</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0; border-right: 4px solid #f5bf23;">
          <h3 style="color: #111; margin: 0 0 10px 0;">${request_title}</h3>
          <p style="color: #666; margin: 0;"><strong>الحالة الجديدة:</strong> ${request_status}</p>
          ${notes ? `<p style="color: #666; margin-top: 10px;">${notes}</p>` : ''}
        </div>
      `;
      break;
      
    case 'vendor_assigned':
      subject = 'تم تعيين فني للطلب';
      mainMessage = `
        <h2 style="color: #f5bf23; margin-bottom: 20px;">مرحباً ${recipient_name}</h2>
        <p style="font-size: 16px; color: #333;">تم تعيين فني متخصص لطلب الصيانة:</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0; border-right: 4px solid #f5bf23;">
          <h3 style="color: #111; margin: 0 0 10px 0;">${request_title}</h3>
          <p style="color: #666; margin: 0;"><strong>الفني المعين:</strong> ${vendor_name}</p>
          <p style="color: #666; margin-top: 10px;">سيتواصل معك الفني قريباً لتحديد موعد الزيارة</p>
        </div>
      `;
      break;
      
    case 'request_completed':
      subject = 'تم إنجاز طلب الصيانة';
      mainMessage = `
        <h2 style="color: #f5bf23; margin-bottom: 20px;">تهانينا ${recipient_name}</h2>
        <p style="font-size: 16px; color: #333;">تم إنجاز طلب الصيانة بنجاح:</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0; border-right: 4px solid #28a745;">
          <h3 style="color: #111; margin: 0 0 10px 0;">${request_title}</h3>
          <p style="color: #666; margin: 0;">نشكرك على ثقتك بخدماتنا</p>
          ${notes ? `<p style="color: #666; margin-top: 10px;">${notes}</p>` : ''}
        </div>
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f5bf23 0%, #e8a91a 100%); padding: 40px 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">العزاب للصيانة</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">خدمة صيانة احترافية</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 24px;">
          ${mainMessage}
          
          <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #eee; text-align: center;">
            <a href="https://www.alazab.online/requests/${data.request_id}" 
               style="display: inline-block; background-color: #f5bf23; color: #111; 
                      padding: 14px 32px; text-decoration: none; border-radius: 12px; 
                      font-weight: bold; font-size: 16px;">
              عرض تفاصيل الطلب
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #111; padding: 24px; text-align: center; color: #fff;">
          <p style="margin: 0 0 10px 0; font-size: 14px;">العزاب للصيانة - جودة وثقة</p>
          <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7);">
            للاستفسارات: info@alazab.online | الموقع: www.alazab.online
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailNotificationRequest = await req.json();
    console.log('Sending email notification:', emailData);

    const htmlContent = generateNotificationHTML(emailData);
    
    let subject = '';
    switch (emailData.notification_type) {
      case 'request_created':
        subject = 'تم استلام طلب الصيانة - العزاب';
        break;
      case 'status_update':
        subject = 'تحديث حالة طلب الصيانة - العزاب';
        break;
      case 'vendor_assigned':
        subject = 'تم تعيين فني للطلب - العزاب';
        break;
      case 'request_completed':
        subject = 'تم إنجاز طلب الصيانة - العزاب';
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "العزاب للصيانة <noreply@alazab.online>",
      to: [emailData.recipient_email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email notification:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
