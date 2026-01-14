import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemAPI, chatAPI } from '../api';
import { getPriceComparison, getMarketPrice, mockProductModels } from '../mockData';

export default function ItemDetailPage({ userId }: { userId: number }) {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [similarItems, setSimilarItems] = useState<any[]>([]);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await itemAPI.getItem(itemId);
      setItem(data);
      
      // 유사 상품 로드 (같은 카테고리)
      const allItems = await itemAPI.listItems({ category: data.category });
      const similar = allItems
        .filter((i: any) => i.id !== data.id)
        .slice(0, 4);
      setSimilarItems(similar);
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
            <div className="seller-card">
              <div className="seller-avatar">👤</div>
              <div className="seller-details">
                <p className="seller-name">{item.sellerNickname || 'Unknown'}</p>
                <p className="seller-location">📍 {item.location || '위치 정보 없음'}</p>
                
                {/* 매너 온도 시각화 */}
                <div className="manner-temp">
                  <p className="manner-label">매너 온도</p>
                  <div className="manner-gauge">
                    <div className="manner-fill" style={{ width: '76%' }}></div>
                  </div>
                  <p className="manner-value">36.5°C</p>
                </div>
                
                <div className="seller-stats">
                  <div className="stat">
                    <p className="stat-value">127</p>
                    <p className="stat-label">거래건수</p>
                  </div>
                  <div className="stat">
                    <p className="stat-value">98%</p>
                    <p className="stat-label">긍정평가</p>
                  </div>
                  <div className="stat">
                    <p className="stat-value">⭐ 4.8</p>
                    <p className="stat-label">평점</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="btn-seller-profile">
              👤 판매자 프로필 보기
            </button>
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

      {/* 유사 상품 추천 섹션 */}
      {similarItems.length > 0 && (
        <div className="similar-section">
          <h2 className="section-title">비슷한 상품</h2>
          <div className="similar-grid">
            {similarItems.map((similarItem: any) => (
              <Link key={similarItem.id} to={`/item/${similarItem.id}`} className="similar-card">
                <div className="similar-image">
                  <img src="https://via.placeholder.com/150" alt={similarItem.title} />
                </div>
                <div className="similar-info">
                  <p className="similar-title">{similarItem.title}</p>
                  <p className="similar-price">{similarItem.price?.toLocaleString()}원</p>
                  <p className="similar-location">📍 {similarItem.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
