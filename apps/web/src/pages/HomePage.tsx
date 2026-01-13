import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemAPI } from '../api';
import { getMarketPrice, getPriceComparison } from '../mockData';

const categories = ['ALL', '전자제품', '의류', '가구', '도서', '기타'];

export default function HomePage() {
  const [category, setCategory] = useState('ALL');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [category]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const params = category !== 'ALL' ? { category } : {};
      const data = await itemAPI.listItems(params);
      setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>중고거래</h1>
      
      <div className="category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <div className="items-grid">
          {items.map((item: any) => {
            const priceComparison = item.modelId ? getPriceComparison(item.price, item.modelId) : null;
            
            return (
              <Link key={item.id} to={`/item/${item.id}`} className="item-card">
                <div className="item-image">
                  <img src="https://via.placeholder.com/200" alt={item.title} />
                  {priceComparison?.isGood && (
                    <span className="price-badge good">🎉 저가격</span>
                  )}
                  {priceComparison?.isBad && (
                    <span className="price-badge bad">📈 고가격</span>
                  )}
                </div>
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  {item.modelName && (
                    <p className="item-model">🏷️ {item.modelName}</p>
                  )}
                  <p className="item-price">{item.price?.toLocaleString()}원</p>
                  {priceComparison && (
                    <p className={`price-comparison ${priceComparison.status}`}>
                      시세: {priceComparison.avgPrice?.toLocaleString()}원
                    </p>
                  )}
                  <p className="item-location">📍 {item.location || '위치 정보 없음'}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
