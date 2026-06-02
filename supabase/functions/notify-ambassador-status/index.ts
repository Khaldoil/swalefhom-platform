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
    const { record } = await req.json()
    
    // Get status-specific content
    const getStatusContent = (status: string) => {
      switch(status) {
        case 'approved':
          return {
            subject: 'تهانينا! تم قبول طلبك كسفير للتراث',
            content: `
              <p>مرحباً ${record.name}،</p>
              <p>يسعدنا إخبارك بأنه تم قبول طلبك للانضمام كسفير للتراث في منصة سواليفهم.</p>
              <p>سنتواصل معك قريباً لتزويدك بالمزيد من المعلومات حول دورك كسفير وكيفية المساهمة في حفظ تراثنا.</p>
              <p>نتطلع للعمل معك في رحلة توثيق وحفظ قصص أجدادنا.</p>
            `
          };
        case 'rejected':
          return {
            subject: 'تحديث بخصوص طلبك للانضمام كسفير للتراث',
            content: `
              <p>مرحباً ${record.name}،</p>
              <p>نشكرك على اهتمامك بالانضمام كسفير للتراث في منصة سواليفهم.</p>
              <p>نعتذر عن عدم قبول طلبك في الوقت الحالي. نشجعك على المحاولة مرة أخرى في المستقبل.</p>
              <p>نقدر اهتمامك بحفظ تراثنا ونتمنى لك التوفيق.</p>
            `
          };
        default:
          return null;
      }
    };

    const statusContent = getStatusContent(record.status);
    if (!statusContent) {
      return new Response(
        JSON.stringify({ message: 'No notification needed for this status' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer re_2Lw9zdTy_BwxZUcw6T3xyRLrquVrP2j35',
      },
      body: JSON.stringify({
        from: 'Swalefhom <notifications@swalefhom.com>',
        to: record.email,
        subject: statusContent.subject,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif;">
            ${statusContent.content}
            <br>
            <p>مع تحيات،<br>فريق سواليفهم</p>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    return new Response(
      JSON.stringify({ message: 'Notification sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})