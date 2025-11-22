/**
 * @fileoverview Message List Component
 * @component MessageList
 * NOTE: Simplified version - Can be enhanced with React Virtualized for 1000+ messages
 */

import React, { useRef, useEffect } from 'react';
import './MessageList.css';

export const MessageList = ({ messages, currentUserId, isTyping = false, loading = false }) => {
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hôm qua ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="message-list">
        <div className="message-list-loading">Đang tải tin nhắn...</div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="message-list-empty">
          <p>Chưa có tin nhắn nào</p>
          <small>Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên</small>
        </div>
      ) : (
        <div className="message-list-container">
          {messages.map((message) => {
            const isOwn = message.NguoiGuiID === currentUserId;
            
            // Debug: Log comparison
            if (messages.indexOf(message) === 0) {
              console.log('🔍 Message Debug:', {
                NguoiGuiID: message.NguoiGuiID,
                NguoiGuiIDType: typeof message.NguoiGuiID,
                currentUserId: currentUserId,
                currentUserIdType: typeof currentUserId,
                isOwn: isOwn
              });
            }

            return (
              <div
                key={message.TinNhanID}
                className={`message-bubble ${isOwn ? 'message-own' : 'message-other'}`}
              >
                {!isOwn && (
                  <div className="message-sender">
                    {message.NguoiGuiAnh && (
                      <img src={message.NguoiGuiAnh} alt="" className="message-avatar" />
                    )}
                    <span className="message-sender-name">{message.NguoiGuiTen}</span>
                  </div>
                )}
                <div className="message-content">
                  <p className="message-text">{message.NoiDung}</p>
                  <span className="message-time">{formatTime(message.ThoiGian)}</span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="message-bubble message-other">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;


