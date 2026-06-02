import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = "re_2Lw9zdTy_BwxZUcw6T3xyRLrquVrP2j35";
const ADMIN_EMAIL = "Khaled.m@live.de";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { story, status, adminNote } = await req.json();

    if (!story || !status) {
      throw new Error("Missing required fields");
    }

    const tellerName = story.metadata?.teller_name || 'عزيزنا';
    const tellerEmail = story.metadata?.teller_email;

    if (!tellerEmail) {
      throw new Error("Story does not have teller email");
    }

    const storytellerEmailContent = status === 'published'
      ? {
          subject: '🎉 تم نشر قصتك في سواليفهم!',
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" alt="سواليفهم" style="height: 80px;">
                </div>

                <div style="background: linear-gradient(135deg, #91B9B4 0%, #FAC39B 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                  <h2 style="color: white; margin: 0;">🎉 تم نشر قصتك! 🎉</h2>
                </div>

                <p style="color: #333; margin-bottom: 15px; font-size: 16px;">مرحباً ${tellerName}،</p>

                <p style="color: #333; margin-bottom: 20px; line-height: 1.8;">
                  يسعدنا إخبارك بأنه تم نشر قصة <strong>"${story.title}"</strong> في منصة سواليفهم!
                </p>

                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #91B9B4;">
                  <h3 style="color: #0F2837; margin-top: 0;">معلومات القصة المنشورة:</h3>
                  <p style="margin: 5px 0;"><strong>العنوان:</strong> ${story.title}</p>
                  <p style="margin: 5px 0;"><strong>المنطقة:</strong> ${story.region}</p>
                  <p style="margin: 5px 0;"><strong>التصنيف:</strong> ${story.category}</p>
                </div>

                ${adminNote ? `
                  <div style="background-color: #E8F4F8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #0F2837; margin: 0;"><strong>رسالة من الإدارة:</strong></p>
                    <p style="color: #333; margin: 10px 0 0 0;">${adminNote}</p>
                  </div>
                ` : ''}

                <p style="color: #333; margin: 20px 0; line-height: 1.8;">
                  شكراً لمساهمتك في حفظ تراثنا وتوثيق قصص أجدادنا. قصتك ستبقى إرثاً للأجيال القادمة.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://swalefhom.com/stories/${story.id}" style="display: inline-block; background: linear-gradient(135deg, #91B9B4 0%, #FAC39B 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    اعرض القصة الآن
                  </a>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #91B9B4; font-style: italic; font-size: 14px;">"في كل قصة نرويها، نمد جسراً بين الماضي والمستقبل"</p>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                <p style="color: #333; margin-bottom: 5px;">مع أطيب التحيات،</p>
                <p style="color: #91B9B4; font-weight: bold; margin-bottom: 20px;">فريق سواليفهم</p>

                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                  © ${new Date().getFullYear()} سواليفهم - جميع الحقوق محفوظة
                </p>
              </div>
            </div>
          `
        }
      : {
          subject: 'تحديث بخصوص قصتك في سواليفهم',
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" alt="سواليفهم" style="height: 80px;">
                </div>

                <p style="color: #333; margin-bottom: 15px; font-size: 16px;">مرحباً ${tellerName}،</p>

                <p style="color: #333; margin-bottom: 20px; line-height: 1.8;">
                  شكراً لمشاركة قصة <strong>"${story.title}"</strong> معنا.
                </p>

                <p style="color: #333; margin-bottom: 20px; line-height: 1.8;">
                  بعد مراجعة القصة، نأسف لإخبارك بأنه لا يمكننا نشرها في الوقت الحالي.
                </p>

                ${adminNote ? `
                  <div style="background-color: #FFF3E0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #0F2837; margin: 0;"><strong>سبب عدم النشر:</strong></p>
                    <p style="color: #333; margin: 10px 0 0 0;">${adminNote}</p>
                  </div>
                ` : ''}

                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #333; margin: 0; line-height: 1.8;">
                    يمكنك:
                  </p>
                  <ul style="color: #666; line-height: 1.8;">
                    <li>إعادة إرسال القصة بعد تعديلها</li>
                    <li>مشاركة قصة أخرى من التراث</li>
                    <li>التواصل معنا إذا كان لديك أي استفسار</li>
                  </ul>
                </div>

                <p style="color: #333; margin: 20px 0; line-height: 1.8;">
                  نقدر مساهمتك ونشجعك على الاستمرار في توثيق قصص تراثنا.
                </p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                <p style="color: #333; margin-bottom: 5px;">مع أطيب التحيات،</p>
                <p style="color: #91B9B4; font-weight: bold; margin-bottom: 20px;">فريق سواليفهم</p>

                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                  © ${new Date().getFullYear()} سواليفهم - جميع الحقوق محفوظة
                </p>
              </div>
            </div>
          `
        };

    const storytellerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Swalefhom <stories@swalefhom.com>',
        to: tellerEmail,
        subject: storytellerEmailContent.subject,
        html: storytellerEmailContent.html,
      }),
    });

    if (!storytellerResponse.ok) {
      const errorText = await storytellerResponse.text();
      console.error('Failed to send email to storyteller:', errorText);
    }

    const adminEmailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #0F2837; margin-bottom: 20px;">تم ${status === 'published' ? 'نشر' : 'رفض'} قصة</h2>

          <div style="background-color: ${status === 'published' ? '#E8F5E9' : '#FFEBEE'}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #0F2837; margin: 0 0 10px;">معلومات القصة:</h3>
            <p style="margin: 5px 0;"><strong>العنوان:</strong> ${story.title}</p>
            <p style="margin: 5px 0;"><strong>المنطقة:</strong> ${story.region}</p>
            <p style="margin: 5px 0;"><strong>التصنيف:</strong> ${story.category}</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #0F2837; margin: 0 0 10px;">معلومات الراوي:</h3>
            <p style="margin: 5px 0;"><strong>الاسم:</strong> ${tellerName}</p>
            <p style="margin: 5px 0;"><strong>البريد الإلكتروني:</strong> ${tellerEmail}</p>
          </div>

          <div style="background-color: #E3F2FD; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #0F2837; margin: 0 0 10px;">الحالة:</h3>
            <p style="margin: 0; color: ${status === 'published' ? '#4CAF50' : '#F44336'}; font-weight: bold; font-size: 18px;">
              ${status === 'published' ? '✓ تم النشر' : '✗ تم الرفض'}
            </p>
          </div>

          ${adminNote ? `
            <div style="background-color: #FFF3E0; padding: 15px; border-radius: 8px;">
              <h3 style="color: #0F2837; margin: 0 0 10px;">الملاحظة المرسلة:</h3>
              <p style="margin: 0;">${adminNote}</p>
            </div>
          ` : ''}

          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            تم إرسال هذا الإشعار تلقائياً من نظام سواليفهم
          </p>
        </div>
      </div>
    `;

    const adminResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Swalefhom <stories@swalefhom.com>',
        to: ADMIN_EMAIL,
        subject: `تم ${status === 'published' ? 'نشر' : 'رفض'} قصة: ${story.title}`,
        html: adminEmailHtml,
      }),
    });

    if (!adminResponse.ok) {
      const errorText = await adminResponse.text();
      console.error('Failed to send email to admin:', errorText);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notifications sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
