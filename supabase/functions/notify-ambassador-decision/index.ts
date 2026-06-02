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
    const { application, status, adminNote } = await req.json();

    if (!application || !status) {
      throw new Error("Missing required fields");
    }

    const applicantEmailContent = status === 'approved'
      ? {
          subject: 'تهانينا! تم قبول طلبك كسفير للتراث 🎉',
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" alt="سواليفهم" style="height: 80px;">
                </div>

                <div style="background: linear-gradient(135deg, #91B9B4 0%, #FAC39B 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                  <h2 style="color: white; margin: 0;">🎉 تهانينا! تم قبول طلبك 🎉</h2>
                </div>

                <p style="color: #333; margin-bottom: 15px; font-size: 16px;">مرحباً ${application.name}،</p>

                <p style="color: #333; margin-bottom: 20px; line-height: 1.8;">
                  يسعدنا إخبارك بأنه تم قبول طلبك للانضمام كسفير للتراث في منصة <strong>سواليفهم</strong>.
                </p>

                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #91B9B4;">
                  <h3 style="color: #0F2837; margin-top: 0;">ما هي الخطوات القادمة؟</h3>
                  <ul style="color: #666; line-height: 1.8;">
                    <li>سنتواصل معك قريباً لتزويدك بحساب السفير الخاص بك</li>
                    <li>ستحصل على تدريب شامل حول كيفية توثيق وحفظ القصص التراثية</li>
                    <li>ستكون جزءاً من مجتمع السفراء المتميزين</li>
                  </ul>
                </div>

                ${adminNote ? `
                  <div style="background-color: #E8F4F8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #0F2837; margin: 0;"><strong>ملاحظة من الإدارة:</strong></p>
                    <p style="color: #333; margin: 10px 0 0 0;">${adminNote}</p>
                  </div>
                ` : ''}

                <p style="color: #333; margin: 20px 0; line-height: 1.8;">
                  نتطلع للعمل معك في رحلة توثيق وحفظ قصص أجدادنا وتراثنا العريق.
                </p>

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
          subject: 'تحديث بخصوص طلبك للانضمام كسفير للتراث',
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" alt="سواليفهم" style="height: 80px;">
                </div>

                <p style="color: #333; margin-bottom: 15px; font-size: 16px;">مرحباً ${application.name}،</p>

                <p style="color: #333; margin-bottom: 20px; line-height: 1.8;">
                  نشكرك على اهتمامك بالانضمام كسفير للتراث في منصة <strong>سواليفهم</strong>.
                </p>

                <p style="color: #333; margin-bottom: 20px; line-height: 1.8;">
                  بعد دراسة طلبك، نعتذر عن عدم إمكانية قبوله في الوقت الحالي. هذا لا يقلل من قيمة مساهمتك المحتملة.
                </p>

                ${adminNote ? `
                  <div style="background-color: #FFF3E0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #0F2837; margin: 0;"><strong>ملاحظة من الإدارة:</strong></p>
                    <p style="color: #333; margin: 10px 0 0 0;">${adminNote}</p>
                  </div>
                ` : ''}

                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #333; margin: 0; line-height: 1.8;">
                    نشجعك على:
                  </p>
                  <ul style="color: #666; line-height: 1.8;">
                    <li>التقديم مرة أخرى في المستقبل</li>
                    <li>المساهمة في توثيق القصص التراثية كزائر</li>
                    <li>متابعة منصتنا ودعم رسالتنا</li>
                  </ul>
                </div>

                <p style="color: #333; margin: 20px 0; line-height: 1.8;">
                  نقدر اهتمامك بحفظ تراثنا ونتمنى لك التوفيق.
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

    const applicantResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Swalefhom <notifications@swalefhom.com>',
        to: application.email,
        subject: applicantEmailContent.subject,
        html: applicantEmailContent.html,
      }),
    });

    if (!applicantResponse.ok) {
      const errorText = await applicantResponse.text();
      console.error('Failed to send email to applicant:', errorText);
    }

    const adminEmailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #0F2837; margin-bottom: 20px;">تم ${status === 'approved' ? 'قبول' : 'رفض'} طلب سفير</h2>

          <div style="background-color: ${status === 'approved' ? '#E8F5E9' : '#FFEBEE'}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #0F2837; margin: 0 0 10px;">معلومات المتقدم:</h3>
            <p style="margin: 5px 0;"><strong>الاسم:</strong> ${application.name}</p>
            <p style="margin: 5px 0;"><strong>البريد الإلكتروني:</strong> ${application.email}</p>
            <p style="margin: 5px 0;"><strong>رقم الجوال:</strong> ${application.mobile}</p>
            <p style="margin: 5px 0;"><strong>العمر:</strong> ${application.age}</p>
            <p style="margin: 5px 0;"><strong>المدينة:</strong> ${application.city}</p>
            <p style="margin: 5px 0;"><strong>المؤهل:</strong> ${application.education}</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #0F2837; margin: 0 0 10px;">الحالة:</h3>
            <p style="margin: 0; color: ${status === 'approved' ? '#4CAF50' : '#F44336'}; font-weight: bold; font-size: 18px;">
              ${status === 'approved' ? '✓ تم القبول' : '✗ تم الرفض'}
            </p>
          </div>

          ${adminNote ? `
            <div style="background-color: #E3F2FD; padding: 15px; border-radius: 8px;">
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
        from: 'Swalefhom <notifications@swalefhom.com>',
        to: ADMIN_EMAIL,
        subject: `تم ${status === 'approved' ? 'قبول' : 'رفض'} طلب سفير: ${application.name}`,
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
