import axios from 'axios';
import { mockProductModels, getMarketPrice } from './mockData';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
});

// Mock 데이터 (백엔드 미연결 시 사용)
const USE_MOCK = true; // Spring Boot 실행 시 false로 변경

const mockItems = [
  { id: 1, userId: 1, title: 'iPhone 13 Pro', modelId: 1, modelName: 'iPhone 13 Pro', price: 850000, category: '전자제품', description: '상태 좋은 아이폰 팝니다', location: '강남구', status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 2, userId: 2, title: 'AirPods Pro', modelId: 2, modelName: 'AirPods Pro', price: 200000, category: '전자제품', description: '거의 새것', location: '서초구', status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 3, userId: 1, title: 'MacBook Pro M2', modelId: 3, modelName: 'MacBook Pro M2', price: 1500000, category: '전자제품', description: '2023년 구매', location: '강남구', status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 4, userId: 3, title: 'Nike Air Force 1', modelId: 4, modelName: 'Nike Air Force 1', price: 80000, category: '의류', description: '사이즈 270', location: '송파구', status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 5, userId: 2, title: 'IKEA BEKANT Desk', modelId: 5, modelName: 'IKEA BEKANT Desk', price: 150000, category: '가구', description: '조립식 책상', location: '서초구', status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 6, userId: 3, title: 'Python Programming', modelId: 6, modelName: 'Python Programming', price: 15000, category: '도서', description: '깨끗한 상태', location: '송파구', status: 'AVAILABLE', createdAt: new Date().toISOString() },
];

const mockRooms = [
  { id: 1, itemId: 1, itemTitle: 'iPhone 13 Pro', buyerId: 2, sellerId: 1, lastMessage: '네고 가능한가요?', createdAt: new Date().toISOString() },
  { id: 2, itemId: 3, itemTitle: '맥북 프로 M2', buyerId: 3, sellerId: 1, lastMessage: '직거래 가능할까요?', createdAt: new Date().toISOString() },
];

const mockMessages = [
  { id: 1, roomId: 1, senderId: 2, content: '네고 가능한가요?', isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, roomId: 1, senderId: 1, content: '5만원 정도는 가능합니다', isRead: true, createdAt: new Date(Date.now() - 3000000).toISOString() },
  { id: 3, roomId: 1, senderId: 2, content: '좋습니다! 언제 거래 가능하세요?', isRead: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
];

// User API
export const userAPI = {
  async join(data: any) {
    if (USE_MOCK) {
      return { id: Date.now(), ...data, createdAt: new Date().toISOString() };
    }
    const response = await api.post('/users/join', data);
    return response.data;
  },
  
  async login(data: any) {
    if (USE_MOCK) {
      return { userId: 1, nickname: 'TestUser', token: 'mock-token' };
    }
    const response = await api.post('/users/login', data);
    return response.data;
  },
  
  async getProfile(userId: number) {
    if (USE_MOCK) {
      return { id: userId, nickname: 'TestUser', email: 'test@example.com', location: '강남구' };
    }
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  async updateProfile(userId: number, data: any) {
    if (USE_MOCK) {
      return { id: userId, ...data };
    }
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  }
};

// Item API
export const itemAPI = {
  async createItem(data: any) {
    if (USE_MOCK) {
      const newItem = { id: Date.now(), ...data, status: 'AVAILABLE', createdAt: new Date().toISOString() };
      mockItems.unshift(newItem);
      return newItem;
    }
    const response = await api.post('/items', data);
    return response.data;
  },
  
  async getItem(itemId: number) {
    if (USE_MOCK) {
      return mockItems.find(item => item.id === Number(itemId)) || mockItems[0];
    }
    const response = await api.get(`/items/${itemId}`);
    return response.data;
  },
  
  async listItems(params: any = {}) {
    if (USE_MOCK) {
      let filtered = [...mockItems];
      if (params.category && params.category !== 'ALL') {
        filtered = filtered.filter(item => item.category === params.category);
      }
      if (params.status) {
        filtered = filtered.filter(item => item.status === params.status);
      }
      return filtered;
    }
    const response = await api.get('/items', { params });
    return response.data;
  },
  
  async getUserItems(userId: number) {
    if (USE_MOCK) {
      return mockItems.filter(item => item.userId === userId);
    }
    const response = await api.get(`/items/user/${userId}`);
    return response.data;
  },
  
  async updateItem(itemId: number, data: any) {
    if (USE_MOCK) {
      const index = mockItems.findIndex(item => item.id === itemId);
      if (index !== -1) {
        mockItems[index] = { ...mockItems[index], ...data };
        return mockItems[index];
      }
      return null;
    }
    const response = await api.put(`/items/${itemId}`, data);
    return response.data;
  },
  
  async deleteItem(itemId: number) {
    if (USE_MOCK) {
      const index = mockItems.findIndex(item => item.id === itemId);
      if (index !== -1) {
        mockItems.splice(index, 1);
      }
      return;
    }
    await api.delete(`/items/${itemId}`);
  }
};

// Chat API
export const chatAPI = {
  async createRoom(data: any) {
    if (USE_MOCK) {
      const newRoom = { 
        id: Date.now(), 
        ...data, 
        itemTitle: mockItems.find(i => i.id === data.itemId)?.title || 'Unknown Item',
        lastMessage: '', 
        createdAt: new Date().toISOString() 
      };
      mockRooms.unshift(newRoom);
      return newRoom;
    }
    const response = await api.post('/chats/rooms', data);
    return response.data;
  },
  
  async sendMessage(data: any) {
    if (USE_MOCK) {
      const newMessage = { 
        id: Date.now(), 
        ...data, 
        isRead: false, 
        createdAt: new Date().toISOString() 
      };
      mockMessages.push(newMessage);
      return newMessage;
    }
    const response = await api.post('/chats/messages', data);
    return response.data;
  },
  
  async getMessages(roomId: number) {
    if (USE_MOCK) {
      return mockMessages.filter(msg => msg.roomId === Number(roomId));
    }
    const response = await api.get(`/chats/rooms/${roomId}/messages`);
    return response.data;
  },
  
  async getUserRooms(userId: number) {
    if (USE_MOCK) {
      return mockRooms.filter(room => room.buyerId === userId || room.sellerId === userId);
    }
    const response = await api.get(`/chats/rooms/user/${userId}`);
    return response.data;
  }
};

// Deal API
export const dealAPI = {
  async createDeal(data: any) {
    if (USE_MOCK) {
      return { id: Date.now(), ...data, status: 'PENDING', createdAt: new Date().toISOString() };
    }
    const response = await api.post('/deals', data);
    return response.data;
  },
  
  async getDeal(dealId: number) {
    if (USE_MOCK) {
      return { id: dealId, status: 'CONFIRMED', buyerId: 1, sellerId: 2, price: 100000 };
    }
    const response = await api.get(`/deals/${dealId}`);
    return response.data;
  },
  
  async getUserDeals(userId: number) {
    if (USE_MOCK) {
      return [];
    }
    const response = await api.get(`/deals/user/${userId}`);
    return response.data;
  },
  
  async confirmDeal(dealId: number, userId: number) {
    if (USE_MOCK) {
      return { id: dealId, status: 'CONFIRMED' };
    }
    const response = await api.put(`/deals/${dealId}/confirm`, { userId });
    return response.data;
  },
  
  async completeDeal(dealId: number) {
    if (USE_MOCK) {
      return { id: dealId, status: 'COMPLETED' };
    }
    const response = await api.put(`/deals/${dealId}/complete`);
    return response.data;
  }
};

// Call API
export const callAPI = {
  async initiateCall(data: any) {
    if (USE_MOCK) {
      return { id: Date.now(), ...data, status: 'INITIATED', createdAt: new Date().toISOString() };
    }
    const response = await api.post('/calls', data);
    return response.data;
  },
  
  async updateCallStatus(callId: number, status: string) {
    if (USE_MOCK) {
      return { id: callId, status };
    }
    const response = await api.put(`/calls/${callId}/status`, { status });
    return response.data;
  },
  
  async updateSignal(callId: number, data: any) {
    if (USE_MOCK) {
      return { id: callId, ...data };
    }
    const response = await api.put(`/calls/${callId}/signal`, data);
    return response.data;
  }
};

// Safety API
export const safetyAPI = {
  async createReview(data: any) {
    if (USE_MOCK) {
      return { id: Date.now(), ...data, createdAt: new Date().toISOString() };
    }
    const response = await api.post('/safety/reviews', data);
    return response.data;
  },
  
  async getUserReviews(userId: number) {
    if (USE_MOCK) {
      return [];
    }
    const response = await api.get(`/safety/reviews/${userId}`);
    return response.data;
  },
  
  async blockUser(data: any) {
    if (USE_MOCK) {
      return { id: Date.now(), ...data };
    }
    const response = await api.post('/safety/block', data);
    return response.data;
  },
  
  async unblockUser(blockerId: number, blockedUserId: number) {
    if (USE_MOCK) {
      return;
    }
    await api.delete('/safety/block', { data: { blockerId, blockedUserId } });
  },
  
  async isUserBlocked(blockerId: number, blockedUserId: number) {
    if (USE_MOCK) {
      return false;
    }
    const response = await api.get('/safety/block/check', { params: { blockerId, blockedUserId } });
    return response.data;
  }
};
