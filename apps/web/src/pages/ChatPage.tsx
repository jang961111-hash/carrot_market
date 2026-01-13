import { useState, useEffect } from 'react';
import { chatAPI } from '../api';

export default function ChatPage({ userId, socket }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

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
            </div>
            
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
