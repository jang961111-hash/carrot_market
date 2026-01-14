export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>🥕 당근마켓 Live+</h3>
          <p className="footer-desc">동네에서 더 안전하고 재미있게 거래하세요</p>
        </div>

        <div className="footer-section">
          <h4>서비스</h4>
          <ul>
            <li><a href="/">중고거래</a></li>
            <li><a href="/">라이브방송</a></li>
            <li><a href="/">시세분석</a></li>
            <li><a href="/">동네생활</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>회사</h4>
          <ul>
            <li><a href="/">회사 소개</a></li>
            <li><a href="/">채용 정보</a></li>
            <li><a href="/">블로그</a></li>
            <li><a href="/">보도자료</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>고객 지원</h4>
          <ul>
            <li><a href="/">고객센터</a></li>
            <li><a href="/">자주 묻는 질문</a></li>
            <li><a href="/">공지사항</a></li>
            <li><a href="/">버전 정보</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>팔로우</h4>
          <div className="social-links">
            <a href="/" title="Facebook">👍</a>
            <a href="/" title="Instagram">📷</a>
            <a href="/" title="Twitter">🐦</a>
            <a href="/" title="YouTube">▶️</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 당근마켓 Live+ All rights reserved.</p>
        <div className="footer-links">
          <a href="/">이용약관</a>
          <span>|</span>
          <a href="/">개인정보 처리방침</a>
          <span>|</span>
          <a href="/">위치기반 서비스 약관</a>
        </div>
      </div>
    </footer>
  );
}
