import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { businessId, message, menu } = await req.json();

    if (!message || !businessId) {
      return NextResponse.json({ error: 'بيانات غير مكتملة' }, { status: 400 });
    }

    const menuText = menu && menu.length > 0 
      ? menu.map((item: any) => `- ${item.title} (السعر: ${item.price || 'غير محدد'}): ${item.description || 'بدون وصف'}`).join('\n')
      : 'لا توجد وجبات مسجلة في المنيو حالياً.';

    const lowerMsg = message.toLowerCase();
    let reply = "";

    if (lowerMsg.includes('رخيص') || lowerMsg.includes('سعر') || lowerMsg.includes('اقل')) {
      reply = `أهلاً بك! بناءً على قائمتنا، أنصحك باستعراض الأطباق التالية المتاحة بأسعار مناسبة:\n\n${menuText}\n\nهل تحب أن أجهز لك طلباً لإحداها؟`;
    } else if (lowerMsg.includes('افضل') || lowerMsg.includes('احسن') || lowerMsg.includes('ترشح') || lowerMsg.includes('مميز')) {
      reply = `أكثر الأطباق مبيعاً وإقبالاً لدينا هي الأطباق التالية:\n\n${menuText}\n\nاختر وجبتك المفضلة وسأحولك فوراً للطلب عبر الواتساب!`;
    } else {
      reply = `أهلاً بك في مطعمنا! أنا مساعدك الذكي 🤖. بالنسبة لاستفسارك حول "${message}":\nإليك قائمة الطعام الجاهزة لدينا:\n\n${menuText}\n\nما الذي ترغب بتناوله اليوم؟`;
    }

    const supabase = await createClient();
    await supabase.from('ai_chats').insert([
      { business_id: businessId, user_message: message, ai_response: reply }
    ]);

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في معالجة الطلب' }, { status: 500 });
  }
}