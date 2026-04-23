import { GROQ_API_KEY, ScoredToken } from "./types";

export async function analyzeToken(token: ScoredToken): Promise<string> {
  const prompt = `
    You are a professional crypto analyst. Analyze the following token data and provide a concise (max 3 sentences) verdict.
    Token: ${token.name} (${token.symbol})
    Chain: ${token.chain}
    Price: $${token.price}
    24h Volume: $${token.v24hVolume}
    Liquidity: $${token.liquidity}
    24h Price Change: ${token.v24hChangePercent}%
    Signal Score: ${token.signalScore}/100
    
    Format:
    Verdict: [Buy / Avoid / Risky]
    Reasoning: [Explanation based on the volume/liquidity ratio and momentum]
  `;

  try {
    console.log(`[Groq AI Request] Analyzing ${token.symbol}...`);
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Powerful & Free on Groq
        messages: [
          { role: "system", content: "You are a professional Web3 investment assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Groq API Error]:", response.status, errorText);
      return `Groq API Error (${response.status}): ${errorText.substring(0, 100)}...`;
    }

    const data = await response.json();
    console.log("[Groq Response] Success!");
    return data.choices[0].message.content;
  } catch (error) {
    console.error("[Groq System Error]:", error);
    return "Failed to generate Groq AI insight. Connectivity error.";
  }
}
