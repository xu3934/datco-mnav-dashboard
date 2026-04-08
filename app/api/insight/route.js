import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `Gemini API error: ${response.status}`, details: err },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .join("\n") || "No response generated.";

    return NextResponse.json({ insight: text });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
