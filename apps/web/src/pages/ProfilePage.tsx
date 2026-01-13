import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: user?.nickname || '',
    location: user?.location || '강남구',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const LOCATIONS = ['강남구', '서초구', '송파구', '강동구', '영등포구', '마포구', '성동구', '광진구'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (formData.nickname.length < 2) {
      setError('닉네임은 최소 2자 이상이어야 합니다');
      return;
    }

    try {
      await updateProfile({
        nickname: formData.nickname,
        location: formData.location,
      });
      setSuccess('프로필이 업데이트되었습니다');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>내 프로필</h1>

        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-avatar">
              <span>{user?.nickname?.[0].toUpperCase() || 'U'}</span>
            </div>
            <div className="profile-info">
              <h2>{user?.nickname}</h2>
              <p className="email">{user?.email}</p>
              <div className="manner-score">
                <span className="label">매너 온도</span>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{ width: `${user?.mannerScore || 50}%` }}
                  ></div>
                </div>
                <span className="value">{user?.mannerScore?.toFixed(1)}°C</span>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <div className="profile-details">
              <div className="detail-row">
                <span className="label">거주 지역</span>
                <span className="value">{user?.location}</span>
              </div>
              <div className="detail-row">
                <span className="label">가입일</span>
                <span className="value">{new Date(user?.createdAt || Date.now()).toLocaleDateString('ko-KR')}</span>
              </div>
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                프로필 수정
              </button>
            </div>
          ) : (
            <div className="profile-edit">
              <div className="form-group">
                <label>닉네임</label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="변경할 닉네임을 입력하세요"
                />
              </div>

              <div className="form-group">
                <label>거주 지역</label>
                <select name="location" value={formData.location} onChange={handleChange}>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="button-group">
                <button className="save-button" onClick={handleSaveProfile}>
                  저장
                </button>
                <button className="cancel-button" onClick={() => setIsEditing(false)}>
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <h3>계정 설정</h3>
          <button className="logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>

      <div className="stats-card">
        <h3>활동 통계</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-icon">📦</span>
            <span className="stat-label">판매 물품</span>
            <span className="stat-value">0</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🛒</span>
            <span className="stat-label">구매 내역</span>
            <span className="stat-value">0</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💬</span>
            <span className="stat-label">진행 중인 거래</span>
            <span className="stat-value">0</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span className="stat-label">받은 후기</span>
            <span className="stat-value">0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
