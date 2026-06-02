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
    
    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer re_2Lw9zdTy_BwxZUcw6T3xyRLrquVrP2j35',
      },
      body: JSON.stringify({
        from: 'Swalefhom <notifications@swalefhom.com>',
        to: 'Khaled.m@live.de',
        subject: `طلب سفير جديد: ${record.name}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif;">
            <h2>تم استلام طلب سفير جديد</h2>
            <p><strong>الاسم:</strong> ${record.name}</p>
            <p><strong>البريد الإلكتروني:</strong> ${record.email}</p>
            <p><strong>رقم الجوال:</strong> ${record.mobile}</p>
            <p><strong>العمر:</strong> ${record.age}</p>
            <p><strong>المدينة:</strong> ${record.city}</p>
            <p><strong>المؤهل العلمي:</strong> ${
              record.education === 'high_school' ? 'ثانوية عامة' :
              record.education === 'diploma' ? 'دبلوم' :
              record.education === 'bachelors' ? 'بكالوريوس' :
              record.education === 'masters' ? 'ماجستير' :
              record.education === 'phd' ? 'دكتوراه' : record.education
            }</p>
            <br>
            <h3>الدافع للتقديم:</h3>
            <p>${record.motivation}</p>
            <br>
            <h3>المساهمة المتوقعة:</h3>
            <p>${record.contribution}</p>
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