// 표준 상품 모델 데이터
export interface ProductModel {
  id: number;
  name: string;
  category: string;
  manufacturer: string;
  specifications: string;
  originalPrice: number;
  releaseDate: string;
}

// 시세 통계 데이터
export interface MarketPrice {
  modelId: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  sampleCount: number;
  lastUpdated: string;
}

// Mock 표준 모델 데이터 (초기값)
export const mockProductModels: ProductModel[] = [
  {
    id: 1,
    name: 'iPhone 13 Pro',
    category: '전자제품',
    manufacturer: 'Apple',
    specifications: '6.1" display, A15 Bionic, 12MP dual camera',
    originalPrice: 1099000,
    releaseDate: '2021-09-14',
  },
  {
    id: 2,
    name: 'AirPods Pro',
    category: '전자제품',
    manufacturer: 'Apple',
    specifications: 'Active Noise Cancellation, 24-hour battery',
    originalPrice: 249000,
    releaseDate: '2019-10-30',
  },
  {
    id: 3,
    name: 'MacBook Pro M2',
    category: '전자제품',
    manufacturer: 'Apple',
    specifications: '13" Retina display, M2 chip, 8GB RAM',
    originalPrice: 1299000,
    releaseDate: '2022-01-17',
  },
  {
    id: 4,
    name: 'Nike Air Force 1',
    category: '의류',
    manufacturer: 'Nike',
    specifications: 'Canvas/Leather, White/Black, Sizes 220-300',
    originalPrice: 139000,
    releaseDate: '1982-02-06',
  },
  {
    id: 5,
    name: 'IKEA BEKANT Desk',
    category: '가구',
    manufacturer: 'IKEA',
    specifications: '120x60cm, Birch veneer, Solid wood frame',
    originalPrice: 79900,
    releaseDate: '2015-01-01',
  },
  {
    id: 6,
    name: 'Python Programming',
    category: '도서',
    manufacturer: 'Pearson',
    specifications: '1200 pages, Hardcover, Korean translation',
    originalPrice: 45000,
    releaseDate: '2018-03-15',
  },
  {
    id: 7,
    name: 'iPad Air 5th Gen',
    category: '전자제품',
    manufacturer: 'Apple',
    specifications: '10.9" Liquid Retina, M1 chip, 64GB',
    originalPrice: 799000,
    releaseDate: '2022-03-18',
  },
  {
    id: 8,
    name: 'Sony WH-1000XM5',
    category: '전자제품',
    manufacturer: 'Sony',
    specifications: 'Noise Cancelling, 30-hour battery',
    originalPrice: 449000,
    releaseDate: '2022-09-08',
  },
];

// Mock 시세 데이터 (3개월 평균가)
export const mockMarketPrices: MarketPrice[] = [
  {
    modelId: 1,
    avgPrice: 750000,
    minPrice: 650000,
    maxPrice: 850000,
    sampleCount: 145,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    modelId: 2,
    avgPrice: 180000,
    minPrice: 160000,
    maxPrice: 200000,
    sampleCount: 89,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    modelId: 3,
    avgPrice: 1100000,
    minPrice: 1000000,
    maxPrice: 1250000,
    sampleCount: 67,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    modelId: 4,
    avgPrice: 85000,
    minPrice: 70000,
    maxPrice: 100000,
    sampleCount: 234,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    modelId: 5,
    avgPrice: 45000,
    minPrice: 35000,
    maxPrice: 60000,
    sampleCount: 56,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    modelId: 6,
    avgPrice: 25000,
    minPrice: 15000,
    maxPrice: 35000,
    sampleCount: 32,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    modelId: 7,
    avgPrice: 650000,
    minPrice: 600000,
    maxPrice: 720000,
    sampleCount: 78,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    modelId: 8,
    avgPrice: 380000,
    minPrice: 350000,
    maxPrice: 420000,
    sampleCount: 91,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ProductModel 검색 유틸리티
export function findModelByName(name: string): ProductModel | undefined {
  return mockProductModels.find(
    (m) => m.name.toLowerCase().includes(name.toLowerCase()) ||
           m.category === name
  );
}

// 시세 조회 유틸리티
export function getMarketPrice(modelId: number): MarketPrice | undefined {
  return mockMarketPrices.find((p) => p.modelId === modelId);
}

// 가격 비교 유틸리티
export function getPriceComparison(currentPrice: number, modelId: number) {
  const marketPrice = getMarketPrice(modelId);
  if (!marketPrice) return null;

  const avgPrice = marketPrice.avgPrice;
  const difference = currentPrice - avgPrice;
  const percentDifference = (difference / avgPrice) * 100;

  return {
    currentPrice,
    avgPrice,
    originalPrice: mockProductModels.find(m => m.id === modelId)?.originalPrice || 0,
    difference,
    percentDifference,
    isGood: percentDifference < -30, // 시장 평균보다 30% 이상 저렴
    isBad: percentDifference > 30,   // 시장 평균보다 30% 이상 비쌈
    status: percentDifference < -30 ? 'great' : percentDifference < -10 ? 'good' : percentDifference > 30 ? 'expensive' : 'fair',
  };
}
