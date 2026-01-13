import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { chatAPI } from '../api';
import { mockMarketPrices, mockProductModels, getPriceComparison } from '../mockData';
import { aiUtils } from '../aiUtils';
import './ChatPage.css';

export default function ChatPage({ userId, socket }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [negotiationSuggestion, setNegotiationSuggestion] = useState(null);
  const [userRole, setUserRole] = useState('buyer'); // 'buyer' or 'seller'

  useEffect(() => {
    loadRooms();
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat:message', (message) => {
      if (selectedRoom && message.roomId === selectedRoom.id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('chat:message');
    };
  }, [socket, selectedRoom]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      socket?.emit('chat:join-room', { roomId: selectedRoom.id });
      
      // 시세 정보 기반 네고 제안 생성
      generateNegotiationSuggestion(selectedRoom);
    }

    return () => {
      if (selectedRoom) {
        socket?.emit('chat:leave-room', { roomId: selectedRoom.id });
      }
    };
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      const data = await chatAPI.getUserRooms(userId);
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const data = await chatAPI.getMessages(roomId);
      setMessages(data.reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const message = {
        roomId: selectedRoom.id,
        senderId: userId,
        content: newMessage,
        createdAt: new Date().toISOString()
      };

      await chatAPI.sendMessage(message);
      socket?.emit('chat:message', { roomId: selectedRoom.id, message });
      
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 시세 정보 기반 네고 제안 생성
  const generateNegotiationSuggestion = (room) => {
    if (!room.itemPrice || !room.modelId) return;

    // Mock 시세 정보 가져오기
    const marketPrice = mockMarketPrices.find((p) => p.modelId === room.modelId);
    const productModel = mockProductModels.find((m) => m.id === room.modelId);

    if (!marketPrice || !productModel) return;

    const product = {
      id: productModel.id,
      name: productModel.name,
      category: productModel.category,
      currentPrice: room.itemPrice,
      marketPrice: {
        avgPrice: marketPrice.avgPrice,
        minPrice: marketPrice.minPrice,
        maxPrice: marketPrice.maxPrice,
      },
    };

    // 사용자 역할에 따른 제안 생성
    const role = userRole;
    const suggestion = aiUtils.generateNegotiationSuggestion(product, role as 'seller' | 'buyer');
    setNegotiationSuggestion(suggestion);
  };

  return (
    <div className="chat-container">
      <div className="chat-rooms">
        <h2>채팅 목록</h2>
        <div className="rooms-list">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`room-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
              onClick={() => setSelectedRoom(room)}
            >
              <h4>{room.itemTitle || `채팅방 ${room.id}`}</h4>
              <p className="last-message">{room.lastMessage || '메시지가 없습니다'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-messages">
        {selectedRoom ? (
          <>
            <div className="messages-header">
              <h2>{selectedRoom.itemTitle || `채팅방 ${selectedRoom.id}`}</h2>
              <div className="room-info">
                <span>💰 {selectedRoom.itemPrice?.toLocaleString()}원</span>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="role-selector"
                >
                  <option value="buyer">구매자</option>
                  <option value="seller">판매자</option>
                </select>
              </div>
            </div>

            {/* AI 네고 제안 */}
            {negotiationSuggestion && (
              <div className={`negotiation-suggestion ${negotiationSuggestion.role}`}>
                <div className="suggestion-icon">💡</div>
                <div className="suggestion-content">
                  <div className="suggestion-message">{negotiationSuggestion.message}</div>
                  {negotiationSuggestion.suggestedPrice && (
                    <button className="suggestion-btn">
                      제안가: ₩{negotiationSuggestion.suggestedPrice.toLocaleString()}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            <div className="messages-list">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
                >
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
              />
              <button onClick={sendMessage}>전송</button>
            </div>
          </>
        ) : (
          <div className="no-room-selected">
            <p>채팅방을 선택하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
