import React, { useState, useRef, useEffect } from 'react';
import { HiChatBubbleLeftRight, HiXMark, HiPaperAirplane } from 'react-icons/hi2';
import { getApiBaseUrl } from '../../config/api'; // Helper để lấy URL API (nếu có)
import axios from 'axios';
import './ChatBot.css';

// Fallback nếu không có hàm getApiBaseUrl
const API_URL = typeof getApiBaseUrl === 'function' 
    ? `${getApiBaseUrl()}/api/chatbot` 
    : 'http://localhost:5000/api/chatbot';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            content: 'Xin chào! Tôi là trợ lý ảo của Hommy. Tôi có thể giúp gì cho bạn hôm nay?' 
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Gửi request lên server
            // Chỉ gửi tin nhắn của user mới nhất và ngữ cảnh gần đây (nếu cần)
            // Ở đây mình gửi cả history để AI nhớ ngữ cảnh
            const response = await axios.post(API_URL, {
                messages: [...messages, userMessage].map(msg => ({
                    role: msg.role === 'bot' ? 'assistant' : msg.role, // Groq dùng 'assistant'
                    content: msg.content
                }))
            });

            if (response.data.success) {
                const botMessage = {
                    role: 'assistant',
                    content: response.data.data
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error('API Error');
            }
        } catch (error) {
            console.error('Lỗi chat:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau!'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Nút mở chat */}
            {!isOpen && (
                <button 
                    className="chatbot-trigger" 
                    onClick={() => setIsOpen(true)}
                    title="Chat với trợ lý ảo"
                >
                    <HiChatBubbleLeftRight />
                </button>
            )}

            {/* Khung chat */}
            {isOpen && (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <div>
                            <h3>Trợ lý ảo Hommy</h3>
                            <p>Luôn sẵn sàng hỗ trợ bạn</p>
                        </div>
                        <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                            <HiXMark style={{ width: 20, height: 20 }} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-loading">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <input 
                            type="text" 
                            className="chatbot-input"
                            placeholder="Nhập tin nhắn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            className="chatbot-send-btn"
                            disabled={isLoading || !input.trim()}
                        >
                            <HiPaperAirplane style={{ width: 16, height: 16 }} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatBot;
