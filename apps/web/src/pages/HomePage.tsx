import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemAPI } from '../api';
import { getMarketPrice, getPriceComparison } from '../mockData';

const categories = ['ALL', '전자제품', '의류', '가구', '도서', '기타'];

export default function HomePage() {
  const [category, setCategory] = useState('ALL');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    <>
      {/* Hero Section (original design inspired by official site, not identical) */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="brand-row">
            <span className="brand-icon">🥕</span>
            <span className="brand-name">당근마켓 Live+</span>
          </div>
          <h1 className="hero-title">동네 거래, 라이브로 더 가까이</h1>
          <p className="hero-subtitle">실시간 방송과 시세 분석으로 안전하고 재미있게 거래하세요.</p>

          <div className="hero-search">
            <div className="search-bar">
              <select className="search-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                className="search-input"
                placeholder="검색어를 입력해 주세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button">검색</button>
            </div>
            <div className="chip-group">
              {['인기', '에어컨', '아이폰', '노트북', '원룸', '알바', '중고차'].map((chip) => (
                <button key={chip} className="chip" onClick={() => setSearchTerm(chip)}>{chip}</button>
              ))}
            </div>
          </div>

          <div className="category-tiles">
            {[
              { key: '중고거래', emoji: '🛍️' },
              { key: '알바/과외', emoji: '💼' },
              { key: '부동산', emoji: '🏠' },
              { key: '중고차', emoji: '🚗' },
              { key: '동네업체', emoji: '🏪' },
              { key: '동네생활', emoji: '🧑‍🤝‍🧑' },
              { key: '모임', emoji: '🎉' }
            ].map((tile) => (
              <div key={tile.key} className="tile">
                <div className="tile-icon">{tile.emoji}</div>
                <div className="tile-label">{tile.key}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <h2 className="section-title">요즘 인기 상품</h2>
      
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
          {items
            .filter((item: any) =>
              searchTerm
                ? (item.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                   item.modelName?.toLowerCase()?.includes(searchTerm.toLowerCase()))
                : true
            )
            .map((item: any) => {
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
    </>
  );
}
