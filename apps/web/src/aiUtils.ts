// AI Mock 유틸리티 - 시세 기반 네고 제안 및 추천 질문 생성

interface Product {
  id: number;
  name: string;
  category: string;
  manufacturer?: string;
  description?: string;
  currentPrice: number;
  marketPrice?: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
  };
}

interface NegotiationSuggestion {
  role: 'seller' | 'buyer';
  message: string;
  suggestedPrice?: number;
  priceGap: number;
  percentage: number;
}

interface RecommendedQuestion {
  question: string;
  category: 'condition' | 'defect' | 'usage' | 'warranty' | 'delivery';
  emoji: string;
}

// 판매자/구매자에게 네고 제안 생성
export function generateNegotiationSuggestion(
  product: Product,
  role: 'seller' | 'buyer'
): NegotiationSuggestion | null {
  if (!product.marketPrice) return null;

  const { currentPrice, marketPrice } = product;
  const { avgPrice, minPrice, maxPrice } = marketPrice;
  const difference = currentPrice - avgPrice;
  const percentage = Math.round((difference / avgPrice) * 100);
  const priceGap = Math.abs(difference);

  if (role === 'seller') {
    // 판매자용 제안
    if (percentage > 20) {
      const suggestedPrice = Math.round(avgPrice * 0.95); // 시세의 95%
      return {
        role: 'seller',
        message: `현재 설정 가격이 시세보다 ₩${priceGap.toLocaleString()} 더 비쌉니다.\n₩${suggestedPrice.toLocaleString()}(으)로 조정하면 시세와 비슷해질 거예요! 💡`,
        suggestedPrice,
        priceGap,
        percentage,
      };
    }
  } else {
    // 구매자용 제안
    if (percentage > 15) {
      const suggestedPrice = Math.round(avgPrice * 0.92); // 시세의 92%
      return {
        role: 'buyer',
        message: `이 상품의 가격이 시세보다 ₩${priceGap.toLocaleString()} 더 비싼 편입니다.\n₩${suggestedPrice.toLocaleString()}(으)로 네고해보시는 건 어떨까요? 🤔`,
        suggestedPrice,
        priceGap,
        percentage,
      };
    }
  }

  return null;
}

// 제품 기반 추천 질문 생성 (라이브 방송용)
export function generateRecommendedQuestions(product: Product): RecommendedQuestion[] {
  const questions: RecommendedQuestion[] = [];
  const category = product.category?.toLowerCase() || '';
  const name = product.name?.toLowerCase() || '';

  // 공통 질문
  const commonQuestions = [
    {
      question: '제품을 사용한 기간이 얼마나 되나요?',
      category: 'usage' as const,
      emoji: '⏱️',
    },
    {
      question: '혹시 손상되거나 결함이 있는 부분이 있나요?',
      category: 'defect' as const,
      emoji: '🔍',
    },
    {
      question: '배송이 가능할까요? 배송 비용은?',
      category: 'delivery' as const,
      emoji: '📦',
    },
  ];

  questions.push(...commonQuestions);

  // 카테고리별 질문
  if (
    category.includes('electronics') ||
    category.includes('전자') ||
    name.includes('iphone') ||
    name.includes('macbook')
  ) {
    questions.push({
      question: '배터리 상태는 어떻게 되나요?',
      category: 'condition' as const,
      emoji: '🔋',
    });
    questions.push({
      question: '구매한 지 얼마나 되었나요?',
      category: 'warranty' as const,
      emoji: '📅',
    });
  }

  if (
    category.includes('clothing') ||
    category.includes('의류') ||
    category.includes('shoes')
  ) {
    questions.push({
      question: '사이즈가 정확한가요?',
      category: 'condition' as const,
      emoji: '📏',
    });
    questions.push({
      question: '세탁은 몇 번 했나요?',
      category: 'usage' as const,
      emoji: '🧺',
    });
  }

  if (category.includes('furniture') || category.includes('가구')) {
    questions.push({
      question: '조립이 필요한가요?',
      category: 'condition' as const,
      emoji: '🔨',
    });
    questions.push({
      question: '스크래치나 흠집이 있나요?',
      category: 'defect' as const,
      emoji: '⚠️',
    });
  }

  // 최대 5개까지만 반환
  return questions.slice(0, 5);
}

// AI가 제안한 질문 응답 Mock (데모용)
export function generateAIMockAnswer(
  question: string,
  product: Product
): string {
  const answers: Record<string, string[]> = {
    battery: [
      '배터리 상태는 좋습니다. 화학적으로 98% 용량입니다.',
      '약 6개월 정도 사용했는데 배터리 상태는 양호합니다.',
    ],
    damage: [
      '약간의 미세한 스크래치가 있지만 기능에는 문제가 없습니다.',
      '외관은 깨끗하고 손상이 없습니다.',
    ],
    delivery: [
      '네, 배송 가능하며 배송료는 협의 가능합니다.',
      '택배 발송 가능하며 안전하게 포장해드리겠습니다.',
    ],
    usage: [
      '약 1년 사용했습니다. 상태는 매우 좋습니다.',
      '가끔 사용하는 정도로 거의 새것 같습니다.',
    ],
  };

  let category = 'usage';
  if (question.includes('배터리') || question.includes('battery'))
    category = 'battery';
  if (question.includes('손상') || question.includes('결함')) category = 'damage';
  if (question.includes('배송')) category = 'delivery';

  const categoryAnswers = answers[category] || answers.usage;
  return categoryAnswers[Math.floor(Math.random() * categoryAnswers.length)];
}

// 네고 실시간 추적 (가격 변동에 따른 제안 업데이트)
export function updateNegotiationStatus(
  currentPrice: number,
  originalPrice: number,
  marketPrice: number
): {
  status: 'great-deal' | 'good-deal' | 'fair' | 'expensive' | 'very-expensive';
  message: string;
  emoji: string;
} {
  const percentage = ((currentPrice - marketPrice) / marketPrice) * 100;

  if (percentage < -30) {
    return {
      status: 'great-deal',
      message: '매우 좋은 가격입니다! 🎉',
      emoji: '🎉',
    };
  } else if (percentage < -10) {
    return {
      status: 'good-deal',
      message: '좋은 가격입니다! ✨',
      emoji: '✨',
    };
  } else if (percentage < 10) {
    return {
      status: 'fair',
      message: '적정 가격입니다.',
      emoji: '👍',
    };
  } else if (percentage < 25) {
    return {
      status: 'expensive',
      message: '조금 높은 가격입니다.',
      emoji: '💭',
    };
  } else {
    return {
      status: 'very-expensive',
      message: '네고를 강력히 권장합니다! 💰',
      emoji: '💰',
    };
  }
}

export const aiUtils = {
  generateNegotiationSuggestion,
  generateRecommendedQuestions,
  generateAIMockAnswer,
  updateNegotiationStatus,
};
