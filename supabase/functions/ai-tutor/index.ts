import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  chat: `You are a friendly, expert AI tutor. When a student asks a question:
1. Give a clear, simple explanation
2. Provide a step-by-step breakdown if applicable
3. Use examples when helpful
4. Keep language accessible for students
Format your response using markdown for readability.`,

  notes: `You are a notes simplification expert. Given long notes, produce:
1. **Summary** (2-3 sentences)
2. **Key Concepts** (bullet points)
3. **Important Terms** (with brief definitions)
4. **Quick Review Points** (for revision)
Format using markdown with clear headings.`,

  quiz: `You are a quiz generator. Given a topic, generate exactly 5 multiple-choice questions.
Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "the question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "brief explanation of the correct answer"
    }
  ]
}
Make questions progressively harder. Ensure exactly 4 options per question.`,

  flashcards: `You are a flashcard generator. Given a topic, generate exactly 8 flashcards.
Return a JSON object with this exact structure:
{
  "flashcards": [
    {
      "question": "What is X?",
      "answer": "X is..."
    }
  ]
}
Make flashcards cover key concepts of the topic. Keep answers concise but informative.`,

  timetable: `You are a study planner expert. Given subjects/topics and available hours, generate a structured weekly timetable and study plan.
Return a JSON object with this exact structure:
{
  "timetable": [
    {
      "day": "Monday",
      "slots": [
        { "time": "9:00 AM - 10:30 AM", "subject": "Mathematics", "topic": "Calculus", "type": "study" },
        { "time": "10:30 AM - 10:45 AM", "subject": "Break", "topic": "", "type": "break" }
      ]
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"],
  "weeklyGoals": ["goal 1", "goal 2", "goal 3"]
}
Include breaks every 90 minutes. Alternate between hard and easy subjects. Add revision slots. Make it realistic and student-friendly.`,

  doubt: `You are an expert doubt solver for students. You will be given the text content extracted from a question (from an image, PDF, or typed text). Your job is to:
1. Identify the question or problem
2. Provide a clear, step-by-step solution
3. Explain the underlying concept
4. Give a tip or shortcut if applicable
Format your response using markdown for readability. Be thorough but clear.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { feature, content, messages } = body;

    if (!feature || !systemPrompts[feature]) {
      return new Response(
        JSON.stringify({ error: "Invalid feature specified" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isChat = feature === "chat";
    const isJson = feature === "quiz" || feature === "flashcards" || feature === "timetable";

    const aiMessages = isChat
      ? [{ role: "system", content: systemPrompts.chat }, ...messages]
      : [
          { role: "system", content: systemPrompts[feature] },
          { role: "user", content: content },
        ];

    const requestBody: any = {
      model: "google/gemini-3-flash-preview",
      messages: aiMessages,
    };

    if (isJson) {
      requestBody.response_format = { type: "json_object" };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const responseContent = data.choices?.[0]?.message?.content;

    if (!responseContent) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isJson) {
      let parsed;
      try {
        parsed = JSON.parse(responseContent);
      } catch {
        const match = responseContent.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("Failed to parse AI response");
        }
      }
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ content: responseContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
