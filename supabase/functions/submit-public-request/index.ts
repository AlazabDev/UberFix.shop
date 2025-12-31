import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { rateLimit } from '../_shared/rateLimiter.ts';

/**
 * Public endpoint for submitting maintenance requests via QR code
 * 
 * This is a PUBLIC endpoint with the following security measures:
 * 1. Rate limiting by IP (5 requests per minute)
 * 2. Input validation
 * 3. Required property_id from QR
 * 4. Logs all submissions for monitoring
 * 
 * Required fields:
 * - property_id: UUID (from QR code)
 * - service_type: string (plumbing, electrical, ac, etc.)
 * - images: string[] (optional, base64 encoded)
 * 
 * Optional fields:
 * - notes: string (max 500 chars)
 * - client_phone: string (for tracking)
 */

interface RequestBody {
  property_id: string;
  service_type: string;
  notes?: string;
  client_phone?: string;
  images?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Rate limiting by IP (5 requests per minute for public submission)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    
    const isAllowed = rateLimit(`submit_${clientIP}`, { windowMs: 60000, maxRequests: 5 });
    if (!isAllowed) {
      console.warn(`⚠️ Rate limit exceeded for public submission from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests',
          message_ar: 'يرجى الانتظار قبل المحاولة مرة أخرى',
          message_en: 'Please wait before trying again'
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();

    // Validate required fields
    if (!body.property_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Property ID is required',
          message_ar: 'معرف العقار مطلوب',
          message_en: 'Property ID is required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!body.service_type) {
      return new Response(
        JSON.stringify({ 
          error: 'Service type is required',
          message_ar: 'نوع الخدمة مطلوب',
          message_en: 'Service type is required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.property_id)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid property ID format',
          message_ar: 'صيغة معرف العقار غير صحيحة',
          message_en: 'Invalid property ID format'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitizedNotes = body.notes?.trim().slice(0, 500) || '';
    const sanitizedPhone = body.client_phone?.replace(/[^\d+]/g, '').slice(0, 15) || '';
    const serviceType = body.service_type.trim().toLowerCase();

    // Valid service types
    const validServices = ['plumbing', 'electrical', 'ac', 'carpentry', 'metalwork', 'painting', 'cleaning', 'other'];
    if (!validServices.includes(serviceType)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid service type',
          message_ar: 'نوع الخدمة غير صحيح',
          message_en: 'Invalid service type'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify property exists and get related data
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select(`
        id,
        name,
        address,
        company_id,
        branch_id,
        companies:company_id(id, name),
        branches:branch_id(id, name)
      `)
      .eq('id', body.property_id)
      .maybeSingle();

    if (propertyError || !property) {
      console.error('Property lookup failed:', propertyError);
      return new Response(
        JSON.stringify({ 
          error: 'Property not found',
          message_ar: 'العقار غير موجود',
          message_en: 'Property not found'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate tracking number (8 characters)
    const trackingNumber = `QR${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Service type labels
    const serviceLabels: Record<string, { ar: string; en: string }> = {
      plumbing: { ar: 'سباكة', en: 'Plumbing' },
      electrical: { ar: 'كهرباء', en: 'Electrical' },
      ac: { ar: 'تكييف', en: 'AC' },
      carpentry: { ar: 'نجارة', en: 'Carpentry' },
      metalwork: { ar: 'حدادة', en: 'Metalwork' },
      painting: { ar: 'دهانات', en: 'Painting' },
      cleaning: { ar: 'تنظيف', en: 'Cleaning' },
      other: { ar: 'أخرى', en: 'Other' }
    };

    const serviceLabel = serviceLabels[serviceType] || { ar: serviceType, en: serviceType };

    // Create maintenance request
    const requestData = {
      property_id: property.id,
      company_id: property.company_id,
      branch_id: property.branch_id,
      title: `طلب صيانة - ${serviceLabel.ar}`,
      description: sanitizedNotes || `طلب صيانة ${serviceLabel.ar} من نموذج QR`,
      service_type: serviceType,
      status: 'Open',
      workflow_stage: 'submitted',
      channel: 'qr_guest',
      priority: 'medium',
      location: property.address,
      client_name: 'زائر QR',
      client_phone: sanitizedPhone || null,
      customer_notes: `[رقم المتابعة: ${trackingNumber}]\n${sanitizedNotes}`,
    };

    const { data: createdRequest, error: createError } = await supabaseAdmin
      .from('maintenance_requests')
      .insert([requestData])
      .select('id, created_at')
      .single();

    if (createError) {
      console.error('Failed to create request:', createError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create request',
          message_ar: 'فشل في إنشاء الطلب',
          message_en: 'Failed to create request'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle image uploads if any
    let uploadedImages: string[] = [];
    if (body.images && body.images.length > 0) {
      const maxImages = 5;
      const imagesToProcess = body.images.slice(0, maxImages);

      for (let i = 0; i < imagesToProcess.length; i++) {
        try {
          const base64Data = imagesToProcess[i];
          // Extract base64 content (remove data:image/...;base64, prefix if present)
          const base64Content = base64Data.includes(',') 
            ? base64Data.split(',')[1] 
            : base64Data;
          
          const binaryData = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
          const fileName = `${createdRequest.id}/${Date.now()}-${i}.jpg`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from('maintenance-attachments')
            .upload(fileName, binaryData, {
              contentType: 'image/jpeg',
              upsert: false
            });

          if (!uploadError) {
            const { data: urlData } = supabaseAdmin.storage
              .from('maintenance-attachments')
              .getPublicUrl(fileName);
            
            if (urlData?.publicUrl) {
              uploadedImages.push(urlData.publicUrl);
            }
          }
        } catch (imgError) {
          console.warn('Failed to upload image:', imgError);
        }
      }
    }

    // Log the submission
    await supabaseAdmin.from('audit_logs').insert({
      action: 'QR_REQUEST_SUBMITTED',
      table_name: 'maintenance_requests',
      record_id: createdRequest.id,
      new_values: {
        tracking_number: trackingNumber,
        service_type: serviceType,
        property_id: property.id,
        ip: clientIP,
        images_count: uploadedImages.length,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`✅ QR Request created: ${createdRequest.id} | Tracking: ${trackingNumber}`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        request_id: createdRequest.id,
        tracking_number: trackingNumber,
        message_ar: 'تم إرسال طلبك بنجاح! استخدم رقم المتابعة للتتبع.',
        message_en: 'Request submitted successfully! Use the tracking number to follow up.',
        property: {
          name: property.name,
          address: property.address
        },
        images_uploaded: uploadedImages.length
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in submit-public-request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message_ar: 'حدث خطأ غير متوقع',
        message_en: 'An unexpected error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
