const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport 설정
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  // 실제 애플리케이션에서는 데이터베이스에 사용자 정보를 저장
  const user = {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails[0].value,
    photo: profile.photos[0].value,
    provider: 'google'
  };
  return done(null, user);
}));

// 카카오 OAuth 전략
passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID,
  callbackURL: "http://localhost:5000/auth/kakao/callback"
}, (accessToken, refreshToken, profile, done) => {
  // 카카오 사용자 정보 처리
  const user = {
    id: profile.id,
    name: profile.displayName || profile.username,
    email: profile._json.kakao_account?.email || null,
    photo: profile._json.properties?.profile_image || null,
    provider: 'kakao'
  };
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// 구글 인증 라우트
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // 성공적으로 인증되면 프론트엔드로 리다이렉트
    res.redirect(process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:3000');
  }
);

// 카카오 인증 라우트
app.get('/auth/kakao',
  passport.authenticate('kakao')
);

app.get('/auth/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/login' }),
  (req, res) => {
    // 성공적으로 인증되면 프론트엔드로 리다이렉트
    res.redirect(process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:3000');
  }
);

// API 라우트
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Session destruction failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });
});

// 프로덕션에서 정적 파일 제공
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
