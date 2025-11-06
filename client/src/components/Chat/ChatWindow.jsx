/**
 * @fileoverview Chat Window Component - Main chat interface
 * @component ChatWindow
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineEllipsisVertical } from 'react-icons/hi2';
import useChat from '../../hooks/useChat';
import { useChatContext } from '../../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';

export const ChatWindow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { markConversationAsRead } = useChatContext();
  const {
    messages,
    sendMessage,
    handleTyping,
    markAsRead,
    isTyping,
    loading,
    error,
    isConnected
  } = useChat(parseInt(id));

  const currentUserId = parseInt(localStorage.getItem('userId') || '0');

  // Mark as read khi mở conversation
  useEffect(() => {
    if (id) {
      markAsRead();
      markConversationAsRead(parseInt(id));
    }
  }, [id, markAsRead, markConversationAsRead]);

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
        <button className="chat-window-back-btn" onClick={() => navigate('/chu-du-an/tin-nhan')}>
          <HiOutlineArrowLeft />
        </button>
        
        <div className="chat-window-header-info">
          <h3>Cuộc trò chuyện</h3>
          <p className="chat-window-status">
            {!isConnected ? (
              <span className="status-offline">Đang kết nối lại...</span>
            ) : isTyping ? (
              <span className="status-typing">Đang gõ...</span>
            ) : (
              <span className="status-online">Trực tuyến</span>
            )}
          </p>
        </div>

        <button className="chat-window-menu-btn">
          <HiOutlineEllipsisVertical />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="chat-window-error">
          ⚠️ {error}
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isTyping={isTyping}
        loading={loading}
      />

      {/* Input */}
      <MessageInput
        onSendMessage={sendMessage}
        onTyping={handleTyping}
        disabled={!isConnected}
      />
    </div>
  );
};

export default ChatWindow;


