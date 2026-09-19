import { ConvexError } from "convex/values";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

async function chat(system: string, user: string, json: boolean): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new ConvexError("OPENAI_API_KEY is not set on the deployment");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      ...(json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ConvexError(`OpenAI request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string | null } }[];
  };
  const content = data.choices[0]?.message?.content;
  if (!content) throw new ConvexError("OpenAI returned an empty completion");
  return content;
}

export async function chatJSON<T>(system: string, user: string): Promise<T> {
  const raw = await chat(system, user, true);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ConvexError(`OpenAI returned invalid JSON: ${raw.slice(0, 200)}`);
  }
}

export function chatText(system: string, user: string): Promise<string> {
  return chat(system, user, false);
}
