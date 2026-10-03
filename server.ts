import { GoogleGenAI, Modality } from "@google/genai";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. API routes will fail if invoked.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "placeholder",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function createWavHeader(dataSize: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return header;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // 1. Generate Story Structure
  app.post("/api/story/generate", async (req, res) => {
    try {
      const { topic, targetAge, genre, mainCharacter, pageCount, imageStyle } = req.body;
      const ai = getAiClient();

      const prompt = `Write a charming, kid-friendly story for children aged ${targetAge || "6-8"}.
Topic: ${topic || "a magical adventure"}
Genre: ${genre || "Fantasy"}
Main Character: ${mainCharacter || "a curious young explorer"}
Target Page Count: ${pageCount || 5} pages.

Please return JSON with the following structure:
{
  "title": "Short Catchy Story Title",
  "subtitle": "A playful 1-line subtitle",
  "targetAge": "${targetAge || "6-8"}",
  "genre": "${genre || "Fantasy"}",
  "mainCharacter": "${mainCharacter || "Hero"}",
  "pages": [
    {
      "pageNumber": 1,
      "text": "1-3 sentences suitable for reading aloud to kids.",
      "illustrationPrompt": "Detailed visual description of this scene for an illustrator. Mention ${mainCharacter} and key objects in ${imageStyle || "vibrant storybook"} style."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.8,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No text returned from Gemini story model");
      }

      const storyData = JSON.parse(text);
      res.json({ success: true, story: storyData });
    } catch (err: any) {
      console.error("Error generating story:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate story" });
    }
  });

function generateFallbackSvg(prompt: string, style?: string, character?: string): string {
  const safeTitle = (character || "Little Hero").slice(0, 30);
  const safePrompt = (prompt || "A wonderful magical story adventure").slice(0, 120);
  const pLower = prompt.toLowerCase();
  const isNight = pLower.includes("night") || pLower.includes("bedtime") || pLower.includes("moon") || pLower.includes("sleep");
  const isSpace = pLower.includes("space") || pLower.includes("rocket") || pLower.includes("planet") || pLower.includes("cosmic");

  let bgStart = "#FDE68A";
  let bgEnd = "#BAE6FD";
  let sunOrMoon = `<circle cx="680" cy="110" r="50" fill="#FBBF24" opacity="0.9" />`;

  if (isSpace) {
    bgStart = "#1E1B4B";
    bgEnd = "#312E81";
    sunOrMoon = `<circle cx="680" cy="110" r="42" fill="#E0E7FF" opacity="0.9" /><circle cx="660" cy="95" r="10" fill="#C7D2FE" opacity="0.4" />`;
  } else if (isNight) {
    bgStart = "#0F172A";
    bgEnd = "#1E3A8A";
    sunOrMoon = `<path d="M680,70 A45,45 0 0,0 645,150 A38,38 0 1,1 680,70" fill="#FEF08A" />`;
  }

  const svg = `<svg viewBox="0 0 800 600" width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${bgStart}" />
      <stop offset="100%" stop-color="${bgEnd}" />
    </linearGradient>
    <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.95)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.85)" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0F172A" flood-opacity="0.12" />
    </filter>
  </defs>

  <rect width="800" height="600" fill="url(#skyGrad)" />
  ${sunOrMoon}

  <g fill="white" opacity="0.8">
    <circle cx="120" cy="130" r="26" />
    <circle cx="150" cy="120" r="36" />
    <circle cx="185" cy="130" r="28" />
    <circle cx="500" cy="90" r="22" />
    <circle cx="530" cy="80" r="30" />
    <circle cx="560" cy="90" r="22" />
  </g>

  <path d="M-50,470 Q200,370 450,460 T900,420 L900,600 L-50,600 Z" fill="url(#hillGrad)" opacity="0.9" />
  <path d="M-50,510 Q250,450 550,520 T900,490 L900,600 L-50,600 Z" fill="#10B981" />

  <g filter="url(#shadow)" transform="translate(140, 180)">
    <rect width="520" height="260" rx="32" fill="url(#cardGrad)" stroke="white" stroke-width="3" />
    <circle cx="75" cy="85" r="40" fill="#F59E0B" />
    <text x="75" y="98" font-size="40" text-anchor="middle" font-family="system-ui">✨</text>
    
    <text x="135" y="75" font-size="22" font-weight="bold" fill="#1E293B" font-family="system-ui">${safeTitle}</text>
    <text x="135" y="102" font-size="13" font-weight="600" fill="#64748B" font-family="system-ui">Art Style: ${style || "Whimsical Storybook"}</text>
    <foreignObject x="40" y="140" width="440" height="95">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, -apple-system, sans-serif; font-size: 15px; color: #334155; line-height: 1.5; font-style: italic; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
        "${safePrompt}"
      </div>
    </foreignObject>
  </g>

  <circle cx="280" cy="100" r="4" fill="#FDE047" />
  <circle cx="370" cy="150" r="5" fill="#FDE047" />
  <circle cx="630" cy="270" r="4" fill="#FDE047" />
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

  // 2. Generate Image Illustration (gemini-3-pro-image-preview with 1K, 2K, 4K affordance)
  app.post("/api/image/generate", async (req, res) => {
    const { prompt, imageSize, style, characterDescription } = req.body;
    const targetSize = (imageSize === "2K" || imageSize === "4K" || imageSize === "1K") ? imageSize : "1K";
    const styleGuide = style ? `Art style: ${style}.` : "Art style: colorful whimsical children's book illustration.";
    const charGuide = characterDescription ? `Character visual notes: ${characterDescription}.` : "";
    const fullPrompt = `${prompt}. ${charGuide} ${styleGuide} High clarity, cute, child-friendly, safe, joyful, vibrant color palette.`;

    try {
      const ai = getAiClient();

      // Model requested: gemini-3-pro-image-preview
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "4:3",
            imageSize: targetSize,
          },
        },
      });

      let imageUrl = "";
      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            const mime = part.inlineData.mimeType || "image/png";
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error("No image generated by model");
      }

      res.json({ success: true, imageUrl, imageSize: targetSize });
    } catch (err: any) {
      console.warn("Primary image generation failed or quota reached:", err.message);

      // Handle 429 Quota Exceeded / Free Tier limitation smoothly
      const isQuota = err.status === 429 ||
        err.message?.includes("Quota exceeded") ||
        err.message?.includes("RESOURCE_EXHAUSTED") ||
        err.message?.includes("429");

      if (isQuota) {
        try {
          const ai = getAiClient();
          // Generate a contextual dynamic SVG illustration using Gemini Flash
          const svgResponse = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `Generate a cute, colorful, high-quality SVG illustration suitable for a children's book.
Scene to illustrate: "${prompt}"
Main Character: "${characterDescription || "hero"}"
Art Style: "${styleGuide}"
Output REQUIREMENTS:
- Return ONLY valid raw <svg viewBox="0 0 800 600" width="800" height="600" xmlns="http://www.w3.org/2000/svg">...</svg>.
- Include lovely colorful gradients, whimsical landscape, and cute shapes.
- Do NOT include any markdown, code blocks, or explanations outside the <svg> tags.`,
          });

          const svgText = svgResponse.text || "";
          const svgMatch = svgText.match(/<svg[\s\S]*?<\/svg>/i);
          if (svgMatch) {
            const svgBase64 = Buffer.from(svgMatch[0]).toString("base64");
            return res.json({
              success: true,
              imageUrl: `data:image/svg+xml;base64,${svgBase64}`,
              imageSize: targetSize,
              isFallback: true,
              quotaExceeded: true,
            });
          }
        } catch (svgErr) {
          console.warn("Dynamic SVG fallback error:", svgErr);
        }

        // Return structured vector fallback
        const fallbackUrl = generateFallbackSvg(prompt, style, characterDescription);
        return res.json({
          success: true,
          imageUrl: fallbackUrl,
          imageSize: targetSize,
          isFallback: true,
          quotaExceeded: true,
        });
      }

      // If it's another non-quota error, still provide fallback so the child's story never breaks
      const fallbackUrl = generateFallbackSvg(prompt, style, characterDescription);
      res.json({
        success: true,
        imageUrl: fallbackUrl,
        imageSize: targetSize,
        isFallback: true,
      });
    }
  });

  // 3. Generate Speech TTS (gemini-3.1-flash-tts-preview)
  app.post("/api/tts/generate", async (req, res) => {
    try {
      const { text, voiceName, tone } = req.body;
      const ai = getAiClient();

      const selectedVoice = voiceName || "Kore";
      const tonePrefixes: Record<string, string> = {
        cheerful: "Say cheerfully in a warm storytelling voice: ",
        calm_bedtime: "Say softly and calmly in a peaceful bedtime storytelling tone: ",
        dramatic_adventure: "Say with exciting, dramatic storybook expression: ",
        silly_playful: "Say in a playful, bouncy, humorous storytelling voice: ",
      };

      const spokenPrompt = (tonePrefixes[tone] || tonePrefixes.cheerful) + text;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: spokenPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const rawBase64 = part?.inlineData?.data;

      if (!rawBase64) {
        throw new Error("No audio data returned from Gemini TTS");
      }

      // Convert raw PCM to WAV data URL so HTML5 Audio player plays it instantly
      const pcmBuffer = Buffer.from(rawBase64, "base64");
      const header = createWavHeader(pcmBuffer.length, 24000, 1, 16);
      const wavBuffer = Buffer.concat([header, pcmBuffer]);
      const wavBase64 = wavBuffer.toString("base64");
      const audioUrl = `data:audio/wav;base64,${wavBase64}`;

      res.json({ success: true, audioUrl, voiceName: selectedVoice });
    } catch (err: any) {
      console.error("Error generating TTS:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate speech" });
    }
  });

  // 4. Multi-turn Chat interface with specified models & roles
  app.post("/api/chat/message", async (req, res) => {
    try {
      const { messages, chatRole, chatModel, storyContext } = req.body;
      const ai = getAiClient();

      let selectedModel = "gemini-3.5-flash";
      if (chatModel === "gemini-3.5-pro" || chatModel === "gemini-3.1-pro-preview") {
        selectedModel = "gemini-3.1-pro-preview";
      } else if (chatModel === "gemini-3.1-flash-lite") {
        selectedModel = "gemini-3.1-flash-lite";
      }

      let systemInstruction = "You are a warm, helpful assistant for children.";
      const storyInfo = storyContext
        ? `\n\n[Current Story Title: "${storyContext.title}". Main Character: "${storyContext.mainCharacter}". Summary: "${storyContext.summary}". Current Page Text: "${storyContext.currentPageText || ""}"]`
        : "";

      if (chatRole === "buddy") {
        systemInstruction = `You are Barnaby the Story Owl, a wise, warm, and friendly mascot companion. You love talking about stories, explaining tricky words in simple child-friendly terms, asking fun questions, and celebrating reading! Keep answers encouraging, concise (2-4 sentences), and full of warmth.${storyInfo}`;
      } else if (chatRole === "hero") {
        systemInstruction = `You are ${storyContext?.mainCharacter || "the main hero of the story"}! Speak directly to the child in first person ("I"). Be adventurous, fun, enthusiastic, and share quirky thoughts about your quest! Keep responses imaginative and friendly (2-3 sentences).${storyInfo}`;
      } else if (chatRole === "guide") {
        systemInstruction = `You are Professor Hoot, a calm bedtime guide. Discuss the story's moral lesson, answer curiosity questions, and help kids feel ready for a relaxing sleep or creative daydreaming. Keep tone soothing, warm, and clear.${storyInfo}`;
      }

      const formattedContents = (messages || []).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      let response;
      try {
        response = await ai.models.generateContent({
          model: selectedModel,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      } catch (modelErr: any) {
        if (selectedModel !== "gemini-3.5-flash") {
          console.warn(`Model ${selectedModel} failed (${modelErr.message}), falling back to gemini-3.5-flash`);
          selectedModel = "gemini-3.5-flash";
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
        } else {
          throw modelErr;
        }
      }

      const replyText = response.text || "I'm thinking about that! What else should we explore?";

      res.json({ success: true, reply: replyText, modelUsed: selectedModel });
    } catch (err: any) {
      console.error("Error in chat route:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to process chat message" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StorySprout Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
