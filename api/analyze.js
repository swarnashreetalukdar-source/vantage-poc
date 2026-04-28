export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt missing" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are VANTAGE, an enterprise campaign intelligence platform."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      })
    });

    const data = await response.json();

    // Surface OpenAI errors explicitly
    if (data.error) {
      console.error("OpenAI error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error("Full OpenAI payload:", data);
      return res.status(500).json({
        error: "No content returned by model",
        debug: data
      });
    }

    res.status(200).json({ text });

  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "AI analysis failed" });
  }
}
