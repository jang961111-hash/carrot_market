import { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { mockProductModels, mockMarketPrices, getPriceComparison } from '../mockData';
import './MarketBoardPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MarketBoardPage() {
  const categories = ['전자제품', '의류', '가구', '도서'];

  // 카테고리별 평균 시세 계산
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const modelsInCategory = mockProductModels.filter((m) => m.category === cat);
      const prices = modelsInCategory
        .map((m) => mockMarketPrices.find((p) => p.modelId === m.id)?.avgPrice || 0)
        .filter((p) => p > 0);

      const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b) / prices.length) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

      return {
        category: cat,
        avgPrice,
        maxPrice,
        minPrice,
        count: modelsInCategory.length,
      };
    });
  }, []);

  // 시간대별 시세 추이 (Mock 데이터)
  const priceHistoryData = {
    labels: ['3주 전', '2주 전', '1주 전', '5일 전', '3일 전', '2일 전', '어제', '오늘'],
    datasets: [
      {
        label: '전자제품',
        data: [850000, 840000, 835000, 830000, 825000, 820000, 815000, 810000],
        borderColor: '#ff6f0f',
        backgroundColor: 'rgba(255, 111, 15, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: '의류',
        data: [95000, 94000, 93500, 93000, 92500, 92000, 91500, 91000],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: '가구',
        data: [125000, 122000, 120000, 118000, 115000, 113000, 110000, 108000],
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryStats.map((s) => s.category),
    datasets: [
      {
        label: '평균 시세',
        data: categoryStats.map((s) => s.avgPrice),
        backgroundColor: '#ff6f0f',
      },
      {
        label: '최고가',
        data: categoryStats.map((s) => s.maxPrice),
        backgroundColor: 'rgba(255, 111, 15, 0.5)',
      },
      {
        label: '최저가',
        data: categoryStats.map((s) => s.minPrice),
        backgroundColor: 'rgba(255, 111, 15, 0.2)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return '₩' + value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="market-board-container">
      <div className="board-header">
        <h1>📊 시세 분석 대시보드</h1>
        <p>실시간 중고거래 시장 데이터</p>
      </div>

      {/* 카테고리별 통계 */}
      <div className="stats-section">
        <h2>카테고리별 시세</h2>
        <div className="stats-grid">
          {categoryStats.map((stat) => (
            <div key={stat.category} className="stat-card">
              <h3>{stat.category}</h3>
              <div className="stat-row">
                <span>평균가</span>
                <span className="price">{stat.avgPrice.toLocaleString()}원</span>
              </div>
              <div className="stat-row">
                <span>최고가</span>
                <span className="max-price">{stat.maxPrice.toLocaleString()}원</span>
              </div>
              <div className="stat-row">
                <span>최저가</span>
                <span className="min-price">{stat.minPrice.toLocaleString()}원</span>
              </div>
              <div className="stat-row items-count">
                <span>등록 상품 수</span>
                <span>{stat.count}개</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 시간별 시세 추이 */}
      <div className="chart-section">
        <h2>시간별 시세 추이</h2>
        <div className="chart-container">
          <Line data={priceHistoryData} options={chartOptions} />
        </div>
      </div>

      {/* 카테고리별 비교 */}
      <div className="chart-section">
        <h2>카테고리별 가격 분포</h2>
        <div className="chart-container">
          <Bar
            data={categoryChartData}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  stacked: false,
                },
              },
            }}
          />
        </div>
      </div>

      {/* 모델별 상세 정보 */}
      <div className="models-section">
        <h2>상품 모델별 시세</h2>
        <div className="models-table">
          <thead>
            <tr>
              <th>모델명</th>
              <th>카테고리</th>
              <th>제조사</th>
              <th>평균가</th>
              <th>최고가</th>
              <th>최저가</th>
              <th>변동률</th>
            </tr>
          </thead>
          <tbody>
            {mockProductModels.map((model) => {
              const price = mockMarketPrices.find((p) => p.modelId === model.id);
              const change = price ? Math.round(Math.random() * 20 - 10) : 0; // Mock 변동률

              return (
                <tr key={model.id}>
                  <td className="model-name">{model.name}</td>
                  <td>{model.category}</td>
                  <td>{model.manufacturer}</td>
                  <td className="price">{price?.avgPrice.toLocaleString()}원</td>
                  <td className="max-price">{price?.maxPrice.toLocaleString()}원</td>
                  <td className="min-price">{price?.minPrice.toLocaleString()}원</td>
                  <td className={`change ${change > 0 ? 'up' : change < 0 ? 'down' : 'stable'}`}>
                    {change > 0 ? '📈' : change < 0 ? '📉' : '➡️'} {Math.abs(change)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </div>
      </div>

      {/* 인기 상품 순위 */}
      <div className="ranking-section">
        <h2>🏆 인기 상품 TOP 5</h2>
        <div className="ranking-grid">
          {mockProductModels.slice(0, 5).map((model, idx) => {
            const price = mockMarketPrices.find((p) => p.modelId === model.id);
            const trendingUp = Math.random() > 0.5;

            return (
              <div key={model.id} className="ranking-card">
                <div className="ranking-badge">{idx + 1}</div>
                <div className="ranking-content">
                  <h4>{model.name}</h4>
                  <p className="category">{model.category}</p>
                  <p className="price">{price?.avgPrice.toLocaleString()}원</p>
                  <span className={`trend ${trendingUp ? 'up' : 'down'}`}>
                    {trendingUp ? '⬆️ 상승세' : '⬇️ 하락세'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 시장 분석 */}
      <div className="analysis-section">
        <h2>📈 시장 분석</h2>
        <div className="analysis-cards">
          <div className="analysis-card positive">
            <h4>가장 많이 거래되는 카테고리</h4>
            <p className="category-name">전자제품</p>
            <p className="details">총 {mockProductModels.filter((m) => m.category === '전자제품').length}개 모델</p>
          </div>
          <div className="analysis-card">
            <h4>평균 낙률</h4>
            <p className="percent">약 15-25%</p>
            <p className="details">신품 대비 중고 거래가</p>
          </div>
          <div className="analysis-card positive">
            <h4>가장 저렴한 카테고리</h4>
            <p className="category-name">도서</p>
            <p className="details">평균 가격 {categoryStats.find((s) => s.category === '도서')?.avgPrice.toLocaleString()}원</p>
          </div>
        </div>
      </div>
    </div>
  );
}
