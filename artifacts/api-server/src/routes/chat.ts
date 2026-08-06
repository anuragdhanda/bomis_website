import { Router } from "express";
import Groq from "groq-sdk";

const router = Router();

const groqApiKey = process.env.GROQ_API_KEY?.trim();
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const SYSTEM_PROMPT = `You are a helpful assistant for Birla Open Minds International School (BOMIS), located in Rajound, Haryana, India. You help parents, students, and visitors with questions about the school.

Key facts about BOMIS:
- Full name: Birla Open Minds International School, Rajound
- Affiliated with CBSE board
- Offers classes from Nursery to Class 12
- Focus on holistic education: academics, sports, arts, and character development
- Facilities include modern classrooms, science labs, computer labs, sports grounds, library, and transport
- Admissions: open for all classes, contact the school for current availability
- Admin contact: available via the Contact Us page on the website
- Student portal available for enrolled students

Guidelines:
- Answer in the same language the user writes in (Hindi or English)
- Be friendly, helpful, and concise
- For specific admission queries, fee details, or urgent matters, always suggest contacting the school directly
- Do not make up specific fees, dates, or data you don't know — say you'll need to check with the school office
- Keep responses brief and to the point`;

router.post("/chat", async (req, res) => {
  if (!groq) {
    res.status(503).json({
      error: "The school assistant is temporarily unavailable.",
    });
    return;
  }

  const { messages } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  // Keep only last 10 messages for context window efficiency
  const recentMessages = messages.slice(-10);

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...recentMessages],
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "Sorry, I couldn't generate a response.";
    res.json({ reply });
  } catch {
    res.status(502).json({
      error: "The school assistant could not complete that request.",
    });
  }
});

export default router;
