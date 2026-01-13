import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { mockProductModels, mockMarketPrices } from '../mockData';
import { aiUtils } from '../aiUtils';
import './LiveBroadcastPage.css';

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  message: string;
  timestamp: Date;
  type?: 'user' | 'ai';
}

interface Viewer {
  id: number;
  username: string;
  joinedAt: Date;
}

interface RecommendedQuestion {
  question: string;
  category: 'condition' | 'defect' | 'usage' | 'warranty' | 'delivery';
  emoji: string;
}

export default function LiveBroadcastPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [recommendedQuestions, setRecommendedQuestions] = useState<RecommendedQuestion[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock 비디오 스트림 생성 (실제 카메라 대신)
  const startMockStream = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas를 비디오처럼 사용
    canvas.width = 640;
    canvas.height = 480;

    let frame = 0;
    const animate = () => {
      if (!isLive) return;

      // Mock 비디오 프레임 생성
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#ff6f0f');
      gradient.addColorStop(0.5, '#ff8c3a');
      gradient.addColorStop(1, '#ffaa66');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 움직이는 원 애니메이션
      const x = (Math.sin(frame * 0.05) * 200) + canvas.width / 2;
      const y = (Math.cos(frame * 0.03) * 150) + canvas.height / 2;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.fill();

      // 텍스트
      ctx.fillStyle = 'white';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎥 LIVE 방송 중', canvas.width / 2, 60);
      
      ctx.font = '20px Arial';
      ctx.fillText(productTitle || '상품명', canvas.width / 2, 100);

      frame++;
      requestAnimationFrame(animate);
    };

    animate();

    // Canvas를 비디오 소스로 설정
    const stream = canvas.captureStream(30);
    if (video) {
      video.srcObject = stream;
      video.play();
    }
  };

  // 방송 시작
  const startBroadcast = () => {
    if (!productTitle || !productPrice) {
      alert('상품명과 가격을 입력해주세요');
      return;
    }

    setIsSettingUp(false);
    setIsLive(true);
    startMockStream();

    // 선택된 상품 정보 설정
    const product = mockProductModels.find(
      (m) => m.name.toLowerCase().includes(productTitle.toLowerCase())
    );
    setSelectedProduct(product);

    // AI 추천 질문 생성
    if (product) {
      const questions = aiUtils.generateRecommendedQuestions(product);
      setRecommendedQuestions(questions);
    }

    // Mock 시청자 추가
    setTimeout(() => {
      const mockViewers: Viewer[] = [
        { id: 2, username: '구매자1', joinedAt: new Date() },
        { id: 3, username: '구매자2', joinedAt: new Date() },
      ];
      setViewers(mockViewers);

      // Mock 채팅 메시지
      setTimeout(() => {
        addMockMessage(2, '구매자1', '안녕하세요! 상품 상태 좋아보이네요');
      }, 2000);
      setTimeout(() => {
        addMockMessage(3, '구매자2', '배송 가능한가요?');
      }, 4000);
    }, 3000);
  };

  // Mock 채팅 메시지 추가
  const addMockMessage = (userId: number, username: string, message: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        userId,
        username,
        message,
        timestamp: new Date(),
      },
    ]);
  };

  // 채팅 전송
  const sendChat = () => {
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        userId: user?.id || 1,
        username: user?.nickname || '판매자',
        message: chatInput,
        timestamp: new Date(),
        type: 'user',
      },
    ]);
    setChatInput('');

    // AI 질문에 대한 답변 Mock (3초 후)
    if (
      recommendedQuestions.length > 0 &&
      Math.random() > 0.7
    ) {
      setTimeout(() => {
        const randomQuestion =
          recommendedQuestions[
            Math.floor(Math.random() * recommendedQuestions.length)
          ];
        const answer = aiUtils.generateAIMockAnswer(
          randomQuestion.question,
          selectedProduct || { name: productTitle, category: '', currentPrice: parseInt(productPrice) }
        );

        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            userId: 999,
            username: '🤖 AI 어시스턴트',
            message: answer,
            timestamp: new Date(),
            type: 'ai',
          },
        ]);
      }, 1000);
    }
  };

  // 방송 종료
  const endBroadcast = () => {
    setIsLive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    navigate('/');
  };

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 스트림 정리
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (isSettingUp) {
    return (
      <div className="live-broadcast-setup">
        <div className="setup-container">
          <h1>🎥 라이브 방송 설정</h1>
          <p>실시간으로 상품을 소개하고 판매하세요</p>

          <div className="setup-form">
            <div className="form-group">
              <label>상품명</label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="판매할 상품명을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label>판매가격</label>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="가격을 입력하세요"
              />
            </div>

            <div className="setup-info">
              <h3>📌 방송 안내</h3>
              <ul>
                <li>실시간으로 구매자와 소통할 수 있습니다</li>
                <li>채팅으로 상품 질문에 답변하세요</li>
                <li>방송 중 가격 조정이 가능합니다</li>
                <li>AI 가드가 자동으로 금지어를 필터링합니다</li>
              </ul>
            </div>

            <div className="setup-actions">
              <button className="btn-cancel" onClick={() => navigate('/')}>
                취소
              </button>
              <button className="btn-start" onClick={startBroadcast}>
                🔴 방송 시작
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-broadcast-page">
      <div className="broadcast-header">
        <div className="header-left">
          <span className="live-badge">🔴 LIVE</span>
          <h2>{productTitle}</h2>
          <span className="price-badge">{parseInt(productPrice).toLocaleString()}원</span>
        </div>
        <div className="header-right">
          <span className="viewer-count">👥 {viewers.length}명 시청중</span>
          <button className="btn-end" onClick={endBroadcast}>
            방송 종료
          </button>
        </div>
      </div>

      <div className="broadcast-content">
        <div className="video-section">
          <div className="video-container">
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <video ref={videoRef} autoPlay playsInline muted />
            <div className="video-overlay">
              <div className="live-indicator">
                <span className="pulse"></span>
                <span>LIVE</span>
              </div>
            </div>
          </div>

          <div className="broadcast-controls">
            <div className="control-group">
              <button className="control-btn">
                🎤 마이크
              </button>
              <button className="control-btn">
                🎥 카메라
              </button>
              <button className="control-btn">
                🖼️ 화면공유
              </button>
            </div>
            <div className="stats">
              <span>⏱️ {Math.floor(Math.random() * 60)} 분</span>
              <span>👁️ {viewers.length + Math.floor(Math.random() * 5)} 총 시청자</span>
            </div>
          </div>
        </div>

        <div className="chat-section">
          <div className="viewers-list">
            <h3>시청자 목록 ({viewers.length})</h3>
            <div className="viewer-items">
              {viewers.map((viewer) => (
                <div key={viewer.id} className="viewer-item">
                  <span className="viewer-avatar">👤</span>
                  <span className="viewer-name">{viewer.username}</span>
                  <span className="viewer-badge">시청중</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chat-container">
            <div className="chat-header">
              <h3>💬 실시간 채팅</h3>
              <span className="chat-count">{chatMessages.length}</span>
            </div>

            {recommendedQuestions.length > 0 && (
              <div className="ai-questions-section">
                <div className="ai-questions-header">
                  <h4>🤖 AI 추천 질문</h4>
                </div>
                <div className="ai-questions-list">
                  {recommendedQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="ai-question-item"
                      onClick={() => {
                        setChatInput(`${question.emoji} ${question.question}`);
                      }}
                    >
                      <span className="question-emoji">{question.emoji}</span>
                      <span className="question-text">{question.question}</span>
                      <span className="question-category">{question.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="chat-messages">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.userId === user?.id ? 'mine' : ''}`}
                >
                  <div className="message-header">
                    <span className="message-username">{msg.username}</span>
                    {msg.userId === user?.id && <span className="seller-badge">판매자</span>}
                  </div>
                  <div className="message-content">{msg.message}</div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChat()}
                placeholder="메시지를 입력하세요..."
              />
              <button onClick={sendChat}>전송</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
