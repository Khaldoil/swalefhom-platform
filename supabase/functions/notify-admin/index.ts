import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = "re_2Lw9zdTy_BwxZUcw6T3xyRLrquVrP2j35";
const ADMIN_EMAIL = "Khaled.m@live.de";

interface NotificationData {
  type: 'new_story' | 'new_application' | 'new_blog' | 'new_gallery' | 'new_event' | 'new_training' | 'new_pioneer' | 'system_alert';
  title: string;
  data: any;
  priority?: 'low' | 'medium' | 'high';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const notificationData: NotificationData = await req.json();

    if (!notificationData.type || !notificationData.title) {
      throw new Error("Missing required fields");
    }

    const priorityBadge = notificationData.priority === 'high'
      ? '<span style="background-color: #F44336; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">⚠️ عاجل</span>'
      : notificationData.priority === 'medium'
      ? '<span style="background-color: #FF9800; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">📌 مهم</span>'
      : '<span style="background-color: #4CAF50; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">ℹ️ معلومة</span>';

    const getEmailContent = () => {
      switch (notificationData.type) {
        case 'new_story':
          return {
            subject: `قصة جديدة: ${notificationData.data.title}`,
            body: `
              <div style="background-color: #E8F5E9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">📖 قصة جديدة</h3>
                <p style="margin: 5px 0;"><strong>العنوان:</strong> ${notificationData.data.title}</p>
                <p style="margin: 5px 0;"><strong>المنطقة:</strong> ${notificationData.data.region || 'غير محدد'}</p>
                <p style="margin: 5px 0;"><strong>التصنيف:</strong> ${notificationData.data.category || 'غير محدد'}</p>
                ${notificationData.data.teller_name ? `<p style="margin: 5px 0;"><strong>الراوي:</strong> ${notificationData.data.teller_name}</p>` : ''}
                ${notificationData.data.teller_email ? `<p style="margin: 5px 0;"><strong>البريد:</strong> ${notificationData.data.teller_email}</p>` : ''}
              </div>
            `
          };

        case 'new_application':
          return {
            subject: `طلب سفير جديد: ${notificationData.data.name}`,
            body: `
              <div style="background-color: #E3F2FD; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">🌟 طلب سفير جديد</h3>
                <p style="margin: 5px 0;"><strong>الاسم:</strong> ${notificationData.data.name}</p>
                <p style="margin: 5px 0;"><strong>البريد:</strong> ${notificationData.data.email}</p>
                <p style="margin: 5px 0;"><strong>الجوال:</strong> ${notificationData.data.mobile}</p>
                <p style="margin: 5px 0;"><strong>العمر:</strong> ${notificationData.data.age}</p>
                <p style="margin: 5px 0;"><strong>المدينة:</strong> ${notificationData.data.city}</p>
                <p style="margin: 5px 0;"><strong>المؤهل:</strong> ${notificationData.data.education}</p>
              </div>
            `
          };

        case 'new_blog':
          return {
            subject: `تدوينة جديدة: ${notificationData.data.title}`,
            body: `
              <div style="background-color: #FFF3E0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">✍️ تدوينة جديدة</h3>
                <p style="margin: 5px 0;"><strong>العنوان:</strong> ${notificationData.data.title}</p>
                <p style="margin: 5px 0;"><strong>التصنيف:</strong> ${notificationData.data.category || 'غير محدد'}</p>
                ${notificationData.data.excerpt ? `<p style="margin: 10px 0; color: #666;">${notificationData.data.excerpt}</p>` : ''}
              </div>
            `
          };

        case 'new_gallery':
          return {
            subject: `عنصر معرض جديد: ${notificationData.data.title}`,
            body: `
              <div style="background-color: #F3E5F5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">🖼️ عنصر معرض جديد</h3>
                <p style="margin: 5px 0;"><strong>العنوان:</strong> ${notificationData.data.title}</p>
                <p style="margin: 5px 0;"><strong>النوع:</strong> ${notificationData.data.type || 'غير محدد'}</p>
                ${notificationData.data.description ? `<p style="margin: 10px 0; color: #666;">${notificationData.data.description}</p>` : ''}
              </div>
            `
          };

        case 'new_event':
          return {
            subject: `فعالية جديدة: ${notificationData.data.title}`,
            body: `
              <div style="background-color: #E1F5FE; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">📅 فعالية جديدة</h3>
                <p style="margin: 5px 0;"><strong>العنوان:</strong> ${notificationData.data.title}</p>
                <p style="margin: 5px 0;"><strong>التاريخ:</strong> ${notificationData.data.date || 'غير محدد'}</p>
                <p style="margin: 5px 0;"><strong>الموقع:</strong> ${notificationData.data.location || 'غير محدد'}</p>
                ${notificationData.data.description ? `<p style="margin: 10px 0; color: #666;">${notificationData.data.description}</p>` : ''}
              </div>
            `
          };

        case 'new_training':
          return {
            subject: `دورة تدريبية جديدة: ${notificationData.data.title}`,
            body: `
              <div style="background-color: #FFF9C4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">🎓 دورة تدريبية جديدة</h3>
                <p style="margin: 5px 0;"><strong>العنوان:</strong> ${notificationData.data.title}</p>
                <p style="margin: 5px 0;"><strong>المدة:</strong> ${notificationData.data.duration || 'غير محدد'}</p>
                <p style="margin: 5px 0;"><strong>المستوى:</strong> ${notificationData.data.level || 'غير محدد'}</p>
                ${notificationData.data.description ? `<p style="margin: 10px 0; color: #666;">${notificationData.data.description}</p>` : ''}
              </div>
            `
          };

        case 'new_pioneer':
          return {
            subject: `رائد تراث جديد: ${notificationData.data.name}`,
            body: `
              <div style="background-color: #FFEBEE; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">🏅 رائد تراث جديد</h3>
                <p style="margin: 5px 0;"><strong>الاسم:</strong> ${notificationData.data.name}</p>
                <p style="margin: 5px 0;"><strong>المنطقة:</strong> ${notificationData.data.region || 'غير محدد'}</p>
                ${notificationData.data.bio ? `<p style="margin: 10px 0; color: #666;">${notificationData.data.bio}</p>` : ''}
              </div>
            `
          };

        case 'system_alert':
          return {
            subject: `تنبيه نظام: ${notificationData.title}`,
            body: `
              <div style="background-color: #FFEBEE; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F44336;">
                <h3 style="color: #F44336; margin: 0 0 10px;">⚠️ تنبيه نظام</h3>
                <p style="margin: 10px 0; color: #333;">${notificationData.data.message || 'لا توجد تفاصيل'}</p>
              </div>
            `
          };

        default:
          return {
            subject: notificationData.title,
            body: `
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0F2837; margin: 0 0 10px;">إشعار جديد</h3>
                <p style="margin: 10px 0;">${JSON.stringify(notificationData.data, null, 2)}</p>
              </div>
            `
          };
      }
    };

    const content = getEmailContent();

    const emailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" alt="سواليفهم" style="height: 80px;">
          </div>

          <div style="margin-bottom: 20px;">
            ${priorityBadge}
          </div>

          <h2 style="color: #0F2837; margin-bottom: 20px;">${notificationData.title}</h2>

          ${content.body}

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              <strong>الوقت:</strong> ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://swalefhom.com/admin" style="display: inline-block; background: linear-gradient(135deg, #91B9B4 0%, #FAC39B 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              الذهاب إلى لوحة التحكم
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            تم إرسال هذا الإشعار تلقائياً من نظام سواليفهم<br>
            © ${new Date().getFullYear()} سواليفهم - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Swalefhom <notifications@swalefhom.com>',
        to: ADMIN_EMAIL,
        subject: content.subject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send email:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin notification sent successfully'
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
