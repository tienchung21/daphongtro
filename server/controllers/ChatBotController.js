const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

class ChatBotController {
    static async chat(req, res) {
        try {
            // Debug: Kiểm tra API Key
            // if (!process.env.GROQ_API_KEY) {
            //     console.error('❌ Missing GROQ_API_KEY');
            //     return res.status(500).json({ success: false, message: 'Server Configuration Error: Missing API Key' });
            // }
            
            const { messages } = req.body;

            if (!messages || !Array.isArray(messages)) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu tin nhắn không hợp lệ'
                });
            }

            // System prompt định hình tính cách AI
            const systemMessage = {
                role: "system",
                content: `Bạn là trợ lý ảo thông minh của hệ thống "Hommy" - Nền tảng tìm kiếm phòng trọ nhanh chóng và tiện lợi.
                
                Nhiệm vụ của bạn:
                1. Hỗ trợ người dùng tìm kiếm thông tin về các loại phòng (phòng đơn, ở ghép, căn hộ...).
                2. Giải đáp thắc mắc về quy trình đặt cọc, hợp đồng, và thanh toán.
                3. Tư vấn các tiện ích và khu vực phù hợp với nhu cầu (sinh viên, người đi làm).
                4. Luôn trả lời ngắn gọn, thân thiện, dùng tiếng Việt có dấu.
                5. Nếu không biết câu trả lời, hãy hướng dẫn họ liên hệ hotline: 1900-1234 hoặc email: support@hommy.vn.

                Đừng bịa đặt thông tin nếu không chắc chắn.`
            };

            // Thêm system message vào đầu danh sách
            const conversation = [systemMessage, ...messages];

            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    messages: conversation,
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.7,
                    max_tokens: 1024,
                    stream: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const reply = response.data.choices[0]?.message?.content || "Xin lỗi, tôi đang gặp sự cố kết nối.";

            return res.status(200).json({
                success: true,
                data: reply
            });

        } catch (error) {
            console.error('Lỗi ChatBot Full:', error);
            console.error('Lỗi ChatBot Response Data:', error.response ? error.response.data : 'No response data');
            
            return res.status(500).json({
                success: false,
                message: 'Lỗi xử lý từ phía server',
                error: error.response?.data || error.message
            });
        }
    }
}

module.exports = ChatBotController;
