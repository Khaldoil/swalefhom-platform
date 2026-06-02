import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting story notification process');
    const { record } = await req.json()
    console.log('Received story:', { id: record.id, title: record.title, metadata: record.metadata });
    
    // Send confirmation email to storyteller
    console.log('Sending confirmation email to storyteller:', record.metadata.teller_email);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer re_2Lw9zdTy_BwxZUcw6T3xyRLrquVrP2j35',
      },
      body: JSON.stringify({
        from: 'Swalefhom <stories@swalefhom.com>',
        to: record.metadata.teller_email,
        reply_to: 'support@swalefhom.com',
        subject: 'شكراً لمشاركتك قصة في سواليفهم',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <img src="https://i.postimg.cc/k4JV6Mpk/Artboard-56-copy-2x-8.png" alt="سواليفهم" style="display: block; margin: 0 auto 20px; height: 60px;">
              <img src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" alt="سواليفهم" style="display: block; margin: 0 auto 20px; height: 80px;">
              <h2 style="color: #0F2837; margin-bottom: 20px;">شكراً لمشاركتك في حفظ تراثنا</h2>
              <p style="color: #333; margin-bottom: 15px;">مرحباً ${record.metadata.teller_name}،</p>
              <p style="color: #333; margin-bottom: 15px;">نشكرك على مشاركة قصة "${record.title}" في منصة سواليفهم.</p>
              <p style="color: #333; margin-bottom: 15px;">سنقوم بمراجعة القصة والتأكد من مطابقتها للمعايير، وسنتواصل معك قريباً.</p>
              <div style="margin: 30px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p style="color: #666; margin: 0;">في كل قصة نرويها، نمد جسراً بين الماضي والمستقبل</p>
              </div>
              <p style="color: #333; margin-bottom: 5px;">مع تحيات،</p>
              <p style="color: #333; margin-bottom: 20px;">فريق سواليفهم</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px; text-align: center;">© سواليفهم - جميع الحقوق محفوظة</p>
            </div>
          </div>
        `,
      }),
    })

    const resText = await res.text();
    console.log('Storyteller email response:', { status: res.status, body: resText });

    if (!res.ok) {
      console.error('Resend API error (storyteller email):', resText);
      throw new Error(`Failed to send storyteller email: ${resText}`);
    }
    console.log('Storyteller email sent successfully');

    // Send admin notification
    console.log('Sending admin notification');
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer re_2Lw9zdTy_BwxZUcw6T3xyRLrquVrP2j35',
      },
      body: JSON.stringify({
        from: 'Swalefhom <stories@swalefhom.com>',
        to: 'Khaled.m@live.de',
        reply_to: 'support@swalefhom.com',
        subject: `قصة جديدة: ${record.title}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <img src="https://i.postimg.cc/k4JV6Mpk/Artboard-56-copy-2x-8.png" alt="سواليفهم" style="display: block; margin: 0 auto 20px; height: 60px;">
              <img src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" alt="سواليفهم" style="display: block; margin: 0 auto 20px; height: 80px;">
              <h2 style="color: #0F2837; margin-bottom: 20px;">تم إرسال قصة جديدة</h2>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">معلومات القصة:</h3>
                <p style="margin: 5px 0;"><strong>العنوان:</strong> ${record.title}</p>
                <p style="margin: 5px 0;"><strong>المنطقة:</strong> ${record.region}</p>
                <p style="margin: 5px 0;"><strong>التصنيف:</strong> ${record.category}</p>
                <p style="margin: 5px 0;"><strong>نوع القصة:</strong> ${record.story_type === 'real' ? 'قصة من الواقع' : 'قصة من الخيال'}</p>
              </div>

              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">معلومات الراوي:</h3>
                <p style="margin: 5px 0;"><strong>الاسم:</strong> ${record.metadata.teller_name}</p>
                <p style="margin: 5px 0;"><strong>الجوال:</strong> ${record.metadata.teller_mobile}</p>
                <p style="margin: 5px 0;"><strong>البريد الإلكتروني:</strong> ${record.metadata.teller_email}</p>
                <p style="margin: 5px 0;"><strong>العمر:</strong> ${record.metadata.teller_age}</p>
                <p style="margin: 5px 0;"><strong>المدينة:</strong> ${record.metadata.teller_city}</p>
              </div>

              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">مصدر القصة:</h3>
                <p style="margin: 5px 0;"><strong>المصدر:</strong> ${record.metadata.story_source}</p>
                <p style="margin: 5px 0;"><strong>عمر المصدر:</strong> ${record.metadata.source_age}</p>
              </div>

              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">محتوى القصة:</h3>
                <p style="white-space: pre-wrap;">${record.content}</p>
              </div>

              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px; text-align: center;">© سواليفهم - جميع الحقوق محفوظة</p>
            </div>
          </div>
        `,
      }),
    })

    const adminResText = await adminRes.text();
    console.log('Admin email response:', { status: adminRes.status, body: adminResText });

    if (!adminRes.ok) {
      console.error('Resend API error (admin email):', adminResText);
      throw new Error(`Failed to send admin email: ${adminResText}`);
    }
    console.log('Admin notification sent successfully');

    return new Response(
      JSON.stringify({ message: 'Notifications sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in notification process:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})