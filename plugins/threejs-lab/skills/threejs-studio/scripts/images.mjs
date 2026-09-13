import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { requireValue, text } from "./state.mjs";

// Optional provider fallback for CLI hosts without their own image tool. No SDK or automatic retry.
export async function generateImages(dir, prompt, { count = 2, model = process.env.OPENAI_IMAGE_MODEL,
  key = process.env.OPENAI_API_KEY, fetcher = fetch } = {}) {
  text(prompt, "prompt");
  requireValue(key && model, "Configure OPENAI_API_KEY and OPENAI_IMAGE_MODEL, or use your host's image tool and add-image");
  requireValue(Number.isInteger(count) && count >= 1 && count <= 3, "Choose 1–3 image options");
  const response = await fetcher("https://api.openai.com/v1/images/generations", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, n: count, size: "1024x1024" }), signal: AbortSignal.timeout(300000),
  });
  requireValue(response.ok, `Image provider returned HTTP ${response.status}; no automatic paid retry was made`);
  const result = await response.json();
  requireValue(result.data?.length && result.data.every((item) => typeof item.b64_json === "string"), "Provider must return base64 images");
  const output = join(dir, "generated");
  await mkdir(output, { recursive: true });
  const files = [];
  for (const item of result.data) {
    const file = join(output, `${randomUUID()}.png`);
    await writeFile(file, Buffer.from(item.b64_json, "base64"), { flag: "wx" });
    files.push({ file, provenance: `OpenAI ${model}` });
  }
  return files;
}
