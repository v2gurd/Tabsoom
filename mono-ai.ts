// Supabase Edge Function: mono-ai  (AI chat for Monopoly bots)
// Secrets needed: GEMINI_API_KEY  (optional: MONO_AI_MODEL)
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:CORS});
  try{
    const {bot,persona,from,message,state,history}=await req.json();
    const model=Deno.env.get("MONO_AI_MODEL")||"gemini-2.5-flash";
    const sys=`تو «${bot}» هستی، یک بازیکن ربات در بازی مونوپولی ایرانی. شخصیتت: ${persona}. فارسی محاوره‌ای، کوتاه (حداکثر دو جمله)، شوخ و با ایموجی. اگر کسی درباره‌ی قوانین پرسید ساده توضیح بده. حالا وضعیت بازی: ${state}. هرگز نگو مدل هوش مصنوعی هستی؛ فقط یک بازیکن باش.`;
    const hist=(history||[]).join("\n");
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:[{role:"user",parts:[{text:`گفتگوی اخیر:\n${hist}\n\n${from} به تو گفت: ${message}`}]}],generationConfig:{maxOutputTokens:120,temperature:1}})});
    const j=await r.json();
    const reply=j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||"";
    return new Response(JSON.stringify({reply}),{headers:{...CORS,"Content-Type":"application/json"}});
  }catch(e){return new Response(JSON.stringify({reply:""}),{headers:{...CORS,"Content-Type":"application/json"}})}
});
