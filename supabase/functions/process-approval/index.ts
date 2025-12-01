import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action"); // 'approve' or 'reject'
    const reason = url.searchParams.get("reason") || null;

    if (!token || !action) {
      return new Response(
        generateHtmlResponse(
          "خطأ",
          "❌ رابط غير صالح. يرجى التحقق من الرابط والمحاولة مرة أخرى.",
          "error"
        ),
        {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client info
    const userAgent = req.headers.get("user-agent") || "Unknown";
    const ip = req.headers.get("x-forwarded-for") || 
               req.headers.get("x-real-ip") || 
               "Unknown";

    // Find approval by token
    const { data: approval, error: findError } = await supabase
      .from("request_approvals")
      .select(`
        *,
        maintenance_requests (
          id,
          title,
          description,
          created_by
        )
      `)
      .eq("approval_token", token)
      .single();

    if (findError || !approval) {
      return new Response(
        generateHtmlResponse(
          "غير موجود",
          "❌ رابط الموافقة غير موجود أو تم استخدامه مسبقاً.",
          "error"
        ),
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // Check if already processed
    if (approval.status !== "pending") {
      const statusText = {
        approved: "تمت الموافقة",
        rejected: "تم الرفض",
        expired: "انتهت الصلاحية"
      }[approval.status] || "تمت المعالجة";

      return new Response(
        generateHtmlResponse(
          "تم المعالجة مسبقاً",
          `ℹ️ هذا الطلب ${statusText} مسبقاً في ${new Date(approval.updated_at).toLocaleString('ar-EG')}.`,
          "info"
        ),
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // Check if expired
    if (new Date(approval.token_expires_at) < new Date()) {
      await supabase
        .from("request_approvals")
        .update({ status: "expired" })
        .eq("id", approval.id);

      return new Response(
        generateHtmlResponse(
          "انتهت الصلاحية",
          "⏰ انتهت صلاحية رابط الموافقة. يرجى التواصل مع الإدارة.",
          "warning"
        ),
        {
          status: 410,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // Process approval/rejection
    const now = new Date().toISOString();
    const updateData: any = {
      status: action === "approve" ? "approved" : "rejected",
      ip_address: ip,
      user_agent: userAgent,
    };

    if (action === "approve") {
      updateData.approved_at = now;
    } else {
      updateData.rejected_at = now;
      updateData.rejection_reason = reason;
    }

    const { error: updateError } = await supabase
      .from("request_approvals")
      .update(updateData)
      .eq("id", approval.id);

    if (updateError) {
      throw updateError;
    }

    // Log in audit trail
    await supabase.from("approval_audit_log").insert({
      request_id: approval.request_id,
      approval_id: approval.id,
      action: action === "approve" ? "approved" : "rejected",
      performed_by_email: approval.approver_email,
      performed_by_name: approval.approver_name,
      previous_status: "pending",
      new_status: action === "approve" ? "approved" : "rejected",
      notes: reason,
      ip_address: ip,
      user_agent: userAgent,
      metadata: {
        step_order: approval.step_order,
        token_used: true,
      },
    });

    // Check if all approvals are done
    const { data: allApprovals } = await supabase
      .from("request_approvals")
      .select("status")
      .eq("request_id", approval.request_id)
      .order("step_order");

    let maintenanceStatus = "Open";
    
    if (action === "reject") {
      maintenanceStatus = "Rejected";
    } else {
      const allApproved = allApprovals?.every((a) => a.status === "approved");
      if (allApproved) {
        maintenanceStatus = "Assigned"; // جاهز للتنفيذ
      } else {
        maintenanceStatus = "Open"; // بانتظار موافقات أخرى
      }
    }

    // Update maintenance request status
    await supabase
      .from("maintenance_requests")
      .update({ 
        status: maintenanceStatus,
        workflow_stage: action === "reject" ? "cancelled" : (
          allApprovals?.every((a) => a.status === "approved") ? "assigned" : "submitted"
        )
      })
      .eq("id", approval.request_id);

    const successMessage = action === "approve"
      ? `✅ تمت الموافقة بنجاح على طلب الصيانة: ${approval.maintenance_requests.title}`
      : `❌ تم رفض طلب الصيانة: ${approval.maintenance_requests.title}`;

    const nextStepMessage = action === "approve"
      ? allApprovals?.every((a) => a.status === "approved")
        ? "<p>🎉 جميع الموافقات تمت! الطلب جاهز للتنفيذ الآن.</p>"
        : "<p>⏳ بانتظار موافقات أخرى لاستكمال سير العمل.</p>"
      : "<p>سيتم إشعار مُنشئ الطلب بالرفض.</p>";

    return new Response(
      generateHtmlResponse(
        "نجح",
        successMessage + nextStepMessage,
        "success"
      ),
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in process-approval function:", error);
    return new Response(
      generateHtmlResponse(
        "خطأ",
        `❌ حدث خطأ أثناء معالجة الطلب: ${error.message}`,
        "error"
      ),
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      }
    );
  }
};

function generateHtmlResponse(
  title: string,
  message: string,
  type: "success" | "error" | "warning" | "info"
): string {
  const colors = {
    success: { bg: "#10b981", border: "#059669" },
    error: { bg: "#ef4444", border: "#dc2626" },
    warning: { bg: "#f59e0b", border: "#d97706" },
    info: { bg: "#3b82f6", border: "#2563eb" },
  };

  const color = colors[type];

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          max-width: 600px;
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .header {
          background-color: ${color.bg};
          border-bottom: 4px solid ${color.border};
          color: white;
          padding: 40px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 40px;
          text-align: center;
        }
        .message {
          font-size: 18px;
          line-height: 1.8;
          color: #333;
          margin: 20px 0;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 30px;
          background-color: ${color.bg};
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          transition: all 0.3s;
        }
        .button:hover {
          background-color: ${color.border};
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <div class="message">
            ${message}
          </div>
          <a href="/" class="button">العودة للصفحة الرئيسية</a>
        </div>
        <div class="footer">
          <p>نظام إدارة طلبات الصيانة</p>
          <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);
