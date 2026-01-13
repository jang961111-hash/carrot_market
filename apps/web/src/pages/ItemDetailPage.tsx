import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemAPI, chatAPI } from '../api';
import { getPriceComparison, getMarketPrice, mockProductModels } from '../mockData';

export default function ItemDetailPage({ userId }: { userId: number }) {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await itemAPI.getItem(itemId);
      setItem(data);
    } catch (error) {
      console.error('Failed to load item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const room = await chatAPI.createRoom({
        itemId: item.id,
        buyerId: userId,
        sellerId: item.userId
      });
      navigate('/chat', { state: { roomId: room.id } });
    } catch (error) {
      console.error('Failed to create chat room:', error);
      alert('채팅방 생성에 실패했습니다.');
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!item) return <div className="error">상품을 찾을 수 없습니다.</div>;

  const priceComparison = item.modelId ? getPriceComparison(item.price, item.modelId) : null;
  const modelInfo = item.modelId ? mockProductModels.find((m) => m.id === item.modelId) : null;

  return (
    <div className="container">
      <div className="item-detail">
        <div className="item-detail-image">
          <img src="https://via.placeholder.com/400" alt={item.title} />
        </div>
        
        <div className="item-detail-info">
          <h1>{item.title}</h1>
          
          {item.modelName && (
            <div className="model-info">
              <p className="model-label">🏷️ 모델명: {item.modelName}</p>
              {modelInfo && (
                <p className="model-specs">제조사: {modelInfo.manufacturer}</p>
              )}
            </div>
          )}
          
          <div className="price-section">
            <p className="price">{item.price?.toLocaleString()}원</p>
            
            {priceComparison && (
              <div className={`price-comparison-card ${priceComparison.status}`}>
                <h4>시세 정보</h4>
                <div className="comparison-row">
                  <span>현재 가격:</span>
                  <span className="bold">{priceComparison.currentPrice?.toLocaleString()}원</span>
                </div>
                <div className="comparison-row">
                  <span>평균 시세:</span>
                  <span className="bold">{priceComparison.avgPrice?.toLocaleString()}원</span>
                </div>
                <div className="comparison-row">
                  <span>신품 원가:</span>
                  <span className="bold">{priceComparison.originalPrice?.toLocaleString()}원</span>
                </div>
                <div className="comparison-status">
                  {priceComparison.isGood && (
                    <p className="good-deal">🎉 시세 대비 {Math.abs(priceComparison.percentDifference).toFixed(1)}% 저렴합니다!</p>
                  )}
                  {priceComparison.isBad && (
                    <p className="bad-deal">⚠️ 시세 대비 {priceComparison.percentDifference.toFixed(1)}% 비쌉니다</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="location">📍 거래 지역: {item.location || '위치 정보 없음'}</p>
          {item.condition && <p className="condition">상태: {item.condition === 'A' ? '상' : item.condition === 'B' ? '중' : '하'}</p>}
          
          <div className="seller-info">
            <h3>판매자 정보</h3>
            <p>닉네임: {item.sellerNickname || 'Unknown'}</p>
          </div>

          <div className="description">
            <h3>상품 설명</h3>
            <p>{item.description || '설명이 없습니다.'}</p>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={handleStartChat}>
              💬 채팅하기
            </button>
            <button className="btn-secondary">
              ❤️ 찜하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
