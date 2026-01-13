import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { itemAPI } from '../api';
import { mockProductModels } from '../mockData';
import './SellPage.css';

const CATEGORIES = ['전자제품', '의류', '가구', '도서', '스포츠', '기타'];

export default function SellPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    modelId: '',
    modelName: '',
    category: '전자제품',
    price: '',
    description: '',
    location: user?.location || '강남구',
    condition: 'A', // A: 상, B: 중, C: 하
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, modelName: value }));
    setShowModelSuggestions(value.length > 0);
  };

  const selectModel = (model: any) => {
    setFormData((prev) => ({
      ...prev,
      modelId: String(model.id),
      modelName: model.name,
    }));
    setShowModelSuggestions(false);
  };

  const filteredModels = formData.modelName
    ? mockProductModels.filter(
        (m) =>
          m.name.toLowerCase().includes(formData.modelName.toLowerCase()) &&
          m.category === formData.category
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 검증
    if (!formData.title || !formData.price || !formData.description) {
      setError('필수 항목을 모두 입력해주세요');
      return;
    }

    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError('유효한 가격을 입력해주세요');
      return;
    }

    if (formData.title.length < 5) {
      setError('제목은 최소 5자 이상이어야 합니다');
      return;
    }

    try {
      const itemData = {
        userId: user?.id || 1,
        ...formData,
        price: Number(formData.price),
        modelId: formData.modelId ? Number(formData.modelId) : null,
      };

      const newItem = await itemAPI.createItem(itemData);
      setSuccess('상품이 등록되었습니다!');
      
      setTimeout(() => {
        navigate(`/item/${newItem.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || '상품 등록에 실패했습니다');
    }
  };

  return (
    <div className="sell-container">
      <div className="sell-card">
        <h1>상품 판매</h1>
        <p className="subtitle">새로운 상품을 판매하세요</p>

        <form onSubmit={handleSubmit} className="sell-form">
          <div className="form-group">
            <label htmlFor="title">상품명 *</label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="판매하실 상품의 제목을 입력하세요"
              value={formData.title}
              onChange={handleChange}
              minLength={5}
              required
            />
            <small>{formData.title.length}/50자</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">카테고리 *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="condition">상태 *</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="A">상 (거의 새것)</option>
                <option value="B">중 (사용감 있음)</option>
                <option value="C">하 (많이 사용됨)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="modelName">모델명</label>
            <input
              id="modelName"
              type="text"
              name="modelName"
              placeholder="상품의 모델명을 입력하세요 (예: iPhone 13 Pro)"
              value={formData.modelName}
              onChange={handleModelNameChange}
              autoComplete="off"
            />
            {showModelSuggestions && filteredModels.length > 0 && (
              <div className="model-suggestions">
                <p className="suggestions-label">추천 모델:</p>
                {filteredModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    className="suggestion-item"
                    onClick={() => selectModel(model)}
                  >
                    <span className="model-name">{model.name}</span>
                    <span className="manufacturer">{model.manufacturer}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">가격 (원) *</label>
              <input
                id="price"
                type="number"
                name="price"
                placeholder="가격을 입력하세요"
                value={formData.price}
                onChange={handleChange}
                min="1000"
                step="1000"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">거래 지역</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                disabled
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">상세 설명 *</label>
            <textarea
              id="description"
              name="description"
              placeholder="상품에 대한 자세한 설명을 입력하세요. 상태, 사용 기간, 특징 등을 적어주세요."
              value={formData.description}
              onChange={handleChange}
              rows={6}
              minLength={10}
              required
            ></textarea>
            <small>{formData.description.length}/2000자</small>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="submit" className="submit-button">
              📤 상품 등록
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/')}
            >
              취소
            </button>
          </div>
        </form>
      </div>

      <div className="sell-info">
        <h3>💡 상품 등록 팁</h3>
        <ul>
          <li>명확한 사진을 3장 이상 올려주세요</li>
          <li>상품의 실제 상태를 솔직하게 설명해주세요</li>
          <li>모델명을 정확히 입력하면 시세 비교가 가능합니다</li>
          <li>빠른 거래를 위해 합리적인 가격을 책정해주세요</li>
          <li>금지 물품은 판매할 수 없습니다</li>
        </ul>
      </div>
    </div>
  );
}
