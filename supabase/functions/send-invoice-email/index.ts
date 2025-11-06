import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  invoice: {
    id: string;
    invoice_number: string;
    customer_name: string;
    amount: number;
    currency: string;
    due_date?: string;
    issue_date: string;
    payment_method?: string;
    notes?: string;
    items: Array<{
      service_name: string;
      description?: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    total_amount: number;
    customer_email?: string;
    status?: string;
  };
  customer_email: string;
}

const generateInvoiceHTML = (invoice: InvoiceEmailRequest['invoice']): string => {
  const { invoice_number, customer_name, customer_email, issue_date, due_date, status, total_amount, items, notes, payment_method, currency } = invoice;

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة ${invoice_number}</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f5bf23 0%, #e8a91a 100%); padding: 40px 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: bold;">العزاب للصيانة</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">خدمة صيانة احترافية</p>
        </div>

        <!-- Invoice Info -->
        <div style="padding: 24px; background-color: #f9f9f9; border-bottom: 2px solid #f5bf23;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <div style="background: linear-gradient(135deg, #111 0%, #333 100%); color: #f5bf23; padding: 20px; border-radius: 12px; text-align: center; min-width: 200px;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #fff;">فاتورة رقم</h2>
              <p style="margin: 0; font-size: 28px; font-weight: bold;">${invoice_number}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 8px 0; font-size: 14px; color: #666;"><strong>التاريخ:</strong> ${new Date(issue_date).toLocaleDateString('ar-EG')}</p>
              ${due_date ? `<p style="margin: 8px 0; font-size: 14px; color: #666;"><strong>تاريخ الاستحقاق:</strong> ${new Date(due_date).toLocaleDateString('ar-EG')}</p>` : ''}
              ${status ? `<p style="margin: 8px 0; font-size: 14px;"><strong>الحالة:</strong> 
                <span style="color: ${status === 'paid' ? '#28a745' : '#dc3545'}; font-weight: bold;">
                  ${status === 'paid' ? '✓ مدفوعة' : '⏳ غير مدفوعة'}
                </span>
              </p>` : ''}
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div style="padding: 24px; background-color: #fff; border-bottom: 1px solid #eee;">
          <h3 style="color: #111; margin: 0 0 15px 0; font-size: 18px; border-right: 4px solid #f5bf23; padding-right: 12px;">معلومات العميل</h3>
          <p style="margin: 8px 0; color: #666;"><strong>الاسم:</strong> ${customer_name}</p>
          ${customer_email ? `<p style="margin: 8px 0; color: #666;"><strong>البريد الإلكتروني:</strong> ${customer_email}</p>` : ''}
          ${payment_method ? `<p style="margin: 8px 0; color: #666;"><strong>طريقة الدفع:</strong> ${
            payment_method === 'bank_transfer' ? 'تحويل بنكي' :
            payment_method === 'instapay' ? 'انستاباي' :
            payment_method === 'cash' ? 'نقداً' :
            payment_method === 'check' ? 'شيك' : payment_method
          }</p>` : ''}
        </div>

        <!-- Invoice Items -->
        <div style="padding: 24px;">
          <h3 style="color: #111; margin: 0 0 20px 0; font-size: 18px; border-right: 4px solid #f5bf23; padding-right: 12px;">تفاصيل الخدمات</h3>
          <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #111 0%, #333 100%); color: #fff;">
                <th style="padding: 16px; text-align: right; font-weight: bold;">الخدمة</th>
                <th style="padding: 16px; text-align: center; font-weight: bold;">الكمية</th>
                <th style="padding: 16px; text-align: center; font-weight: bold;">السعر</th>
                <th style="padding: 16px; text-align: center; font-weight: bold;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#fff'}; border-bottom: 1px solid #eee;">
                  <td style="padding: 16px;">
                    <strong style="color: #111;">${item.service_name}</strong>
                    ${item.description ? `<br><small style="color: #666; font-size: 12px;">${item.description}</small>` : ''}
                  </td>
                  <td style="padding: 16px; text-align: center; color: #666;">${item.quantity}</td>
                  <td style="padding: 16px; text-align: center; color: #666;">${item.unit_price.toFixed(2)} ${currency}</td>
                  <td style="padding: 16px; text-align: center;"><strong style="color: #111;">${item.total_price.toFixed(2)} ${currency}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Total Amount -->
        <div style="padding: 24px; background: linear-gradient(135deg, #f5bf23 0%, #e8a91a 100%); text-align: center;">
          <h3 style="color: #fff; margin: 0 0 10px 0; font-size: 18px;">المبلغ الإجمالي</h3>
          <p style="color: #fff; margin: 0; font-size: 36px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
            ${total_amount.toFixed(2)} ${currency}
          </p>
        </div>

        ${notes ? `
        <div style="padding: 24px; background-color: #f9f9f9;">
          <h3 style="color: #111; margin: 0 0 15px 0; font-size: 18px; border-right: 4px solid #f5bf23; padding-right: 12px;">ملاحظات</h3>
          <p style="color: #666; margin: 0; line-height: 1.6;">${notes}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="background-color: #111; padding: 24px; text-align: center; color: #fff;">
          <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">شكراً لتعاملكم معنا</p>
          <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7);">
            للاستفسارات: info@alazab.online | الموقع: www.alazab.online
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.5);">
            هذه فاتورة مُنشأة إلكترونياً
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
    const { invoice, customer_email }: InvoiceEmailRequest = await req.json();

    console.log(`Sending invoice ${invoice.invoice_number} to ${customer_email}`);

    const emailResponse = await resend.emails.send({
      from: "العزاب للصيانة <noreply@alazab.online>",
      to: [customer_email],
      subject: `فاتورة رقم ${invoice.invoice_number} - العزاب للصيانة`,
      html: generateInvoiceHTML(invoice),
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
    console.error("Error in send-invoice-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
