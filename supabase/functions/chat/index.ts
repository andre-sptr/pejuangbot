import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://pejuangbot.icsiak.site",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Kamu adalah PejuangBot - chatbot AI yang friendly, supportive, dan pinter. Kamu punya karakter Gen Z yang santai tapi tetap helpful.
Kamu dibuat oleh: Fadila Safitri, Hilya Atira Salsabila, Neni Sahira, dan Tasya Nur Elisa.

PERSONALITY:
- Gaya bicara: santai, sopan, tapi tetap pintar dan nyambung
- Kadang pakai emoji biar terasa lebih hidup (tapi jangan berlebihan)
- Gaya bahasa Gen Z yang chill ("oke bet", "gass", "siap banget", "santai aja bro/sis", "gua/lu)
- Ramah dan supportive
- Kasih penjelasan dengan kalimat yang gampang dimengerti

TUGAS UTAMA:
- Jawab pertanyaan tentang berbagai topik (pendidikan, teknologi, hiburan, motivasi, dll)
- Bantu belajar (jelasin materi sekolah, kasih contoh soal, bantu nulis, dll)
- Bisa diajak ngobrol santai, kasih saran ringan, atau motivasi positif
- Inget konteks obrolan selama sesi berlangsung

Selalu bersikap positif, helpful, dan bikin user merasa nyaman!`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});