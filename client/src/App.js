import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/user', { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      console.log('사용자가 로그인하지 않았습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:5000/auth/kakao';
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout', {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        {user ? (
          <div className="profile-card">
            <div className="profile-header">
              <img src={user.photo} alt="프로필" className="profile-image" />
              <h2>환영합니다!</h2>
            </div>
            <div className="profile-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <p className="user-id">사용자 ID: {user.id}</p>
              <p className="provider-badge">{user.provider === 'google' ? '🔵 구글' : '🟡 카카오'} 계정</p>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              로그아웃
            </button>
          </div>
        ) : (
          <div className="login-card">
            <div className="login-header">
              <h1>간편 로그인</h1>
              <p>구글 또는 카카오 계정으로 빠르고 안전하게 로그인하세요</p>
            </div>
            <button onClick={handleGoogleLogin} className="google-login-btn">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              구글로 로그인
            </button>
            
            <button onClick={handleKakaoLogin} className="kakao-login-btn">
              <svg className="kakao-icon" viewBox="0 0 24 24">
                <path fill="#000000" d="M12 3C6.5 3 2 6.6 2 11.1c0 2.9 1.9 5.4 4.7 6.9l-1.2 4.4c-.1.4.4.7.7.4l5.3-3.5c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8.1S17.5 3 12 3z"/>
              </svg>
              카카오로 로그인
            </button>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <span>안전한 OAuth 2.0 인증</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>빠른 로그인 과정</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎯</span>
                <span>개인정보 보호</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;