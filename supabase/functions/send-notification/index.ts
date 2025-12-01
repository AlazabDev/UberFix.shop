import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.alazab.online',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  maintenanceRequestId: string;
  latitude: number;
  longitude: number;
  serviceType: string;
  clientName: string;
  address: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify authentication
  const auth = req.headers.get('Authorization');
  if (!auth) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Missing Authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { maintenanceRequestId, latitude, longitude, serviceType, clientName, address }: NotificationRequest = await req.json();

    console.log('Finding nearest vendors for request:', maintenanceRequestId);

    // البحث عن أقرب فني باستخدام الدالة التي أنشأناها
    const { data: nearestVendors, error: vendorError } = await supabase
      .rpc('find_nearest_vendor', {
        request_latitude: latitude,
        request_longitude: longitude,
        service_specialization: serviceType
      });

    if (vendorError) {
      console.error('Error finding vendors:', vendorError);
      throw vendorError;
    }

    console.log('Found vendors:', nearestVendors);

    if (!nearestVendors || nearestVendors.length === 0) {
      return new Response(
        JSON.stringify({ message: 'لا يوجد فنيين متاحين في المنطقة' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // إرسال إشعار لأقرب فني
    const nearestVendor = nearestVendors[0];
    
    // الحصول على user_id للفني
    const { data: vendorProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('vendor_id', nearestVendor.vendor_id)
      .single();

    if (profileError || !vendorProfile) {
      console.error('Error finding vendor profile:', profileError);
      throw new Error('Vendor profile not found');
    }

    // إنشاء الإشعار
    const notificationData = {
      title: 'طلب صيانة جديد',
      message: `طلب صيانة جديد من ${clientName} في ${address}. نوع الخدمة: ${serviceType}. المسافة: ${nearestVendor.distance?.toFixed(2)} كم`,
      type: 'info',
      recipient_id: vendorProfile.user_id,
      entity_type: 'maintenance_request',
      entity_id: maintenanceRequestId
    };

    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }

    // تحديث طلب الصيانة لتعيين الفني (استخدام v2)
    const { error: updateError } = await supabase
      .from('maintenance_requests_v2')
      .update({ 
        assigned_vendor_id: nearestVendor.vendor_id,
        status: 'assigned'
      })
      .eq('id', maintenanceRequestId);

    if (updateError) {
      console.error('Error updating maintenance request:', updateError);
    }

    console.log('Notification sent successfully to:', nearestVendor.vendor_name);

    return new Response(
      JSON.stringify({
        success: true,
        vendor: {
          id: nearestVendor.vendor_id,
          name: nearestVendor.vendor_name,
          distance: nearestVendor.distance,
          phone: nearestVendor.phone
        },
        notification: notification
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
