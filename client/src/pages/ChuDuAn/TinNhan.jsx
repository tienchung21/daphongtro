/**
 * @fileoverview Trang Tin nhắn - Chat interface cho Chủ Dự án
 * @component TinNhan
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { ChatProvider } from '../../context/ChatContext';
import ConversationList from '../../components/Chat/ConversationList';
import { useChatContext } from '../../context/ChatContext';
import { HiOutlineInbox } from 'react-icons/hi2';
import './TinNhan.css';

const TinNhanContent = () => {
  const navigate = useNavigate();
  const { conversations, loading, setActiveConversationId, activeConversationId } = useChatContext();
  const [selectedId, setSelectedId] = useState(null);

  const handleSelectConversation = (id) => {
    setSelectedId(id);
    setActiveConversationId(id);
    navigate(`/chu-du-an/tin-nhan/${id}`);
  };

  return (
    <div className="tin-nhan-page">
      <div className="tin-nhan-container">
        <ConversationList
          conversations={conversations}
          activeId={selectedId || activeConversationId}
          onSelect={handleSelectConversation}
          loading={loading}
        />

        <div className="tin-nhan-placeholder">
          <HiOutlineInbox className="placeholder-icon" />
          <h3>Chọn một cuộc trò chuyện</h3>
          <p>Chọn cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin</p>
        </div>
      </div>
    </div>
  );
};

export default function TinNhan() {
  return (
    <ChuDuAnLayout>
      <ChatProvider>
        <TinNhanContent />
      </ChatProvider>
    </ChuDuAnLayout>
  );
}


