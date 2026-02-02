import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize Gemini
// Note: On Netlify, environment variables are set in the Dashboard, not .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";
const SYSTEM_INSTRUCTION = `
Bạn là một Trợ giảng chuyên sâu về môn Lịch sử Việt Nam (Sử Việt).
Nhiệm vụ của bạn là hỗ trợ người dùng học tập, tra cứu và tìm hiểu về lịch sử Việt Nam qua các thời kỳ.

Nguyên tắc cốt lõi:
1. Chỉ trả lời các câu hỏi liên quan đến Lịch sử, Văn hóa, Địa lý lịch sử hoặc Danh nhân Việt Nam.
2. Nếu người dùng hỏi chủ đề không liên quan (ví dụ: code, toán học, giải trí thuần túy), hãy lịch sự từ chối và nhắc họ rằng bạn chỉ chuyên về Sử Việt.
3. Phong cách trả lời:
   - Chính xác, khách quan, dựa trên các sự kiện lịch sử đã được công nhận.
   - Giọng văn hào hùng nhưng điềm đạm, sư phạm, dễ hiểu.
   - Kiên nhẫn giải thích các thuật ngữ khó.
   - Sử dụng định dạng Markdown (in đậm, gạch đầu dòng) để trình bày các mốc thời gian hoặc sự kiện quan trọng cho dễ đọc.
4. Tuyệt đối không bịa đặt sự kiện (hallucination). Nếu không chắc chắn, hãy nói là bạn chưa có dữ liệu chính xác về vấn đề đó.
`;

// Define Router
const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { history, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const recentHistory = Array.isArray(history) 
      ? history
          .filter(msg => !msg.isError)
          .slice(-20)
          .map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.text }],
          }))
      : [];

    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: recentHistory,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage({
      message: message
    });

    res.json({ text: result.text });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ 
      error: "Đã xảy ra lỗi phía máy chủ. Vui lòng thử lại sau." 
    });
  }
});

// Mount router
// Localhost calls: /api/chat
// Netlify calls: /.netlify/functions/api/chat
app.use('/api', router); // For Local
app.use('/.netlify/functions/api', router); // For Netlify Production

export default app;