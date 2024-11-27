const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const SECRET_KEY = 'your-secret-key-for-jwt';
const ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRE_HOURS = 6;

// Passport JWT 전략 설정
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY,
  algorithms: [ALGORITHM]
};

passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await User.findOne({ where: { id: jwtPayload.sub } });
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// JWT 토큰 생성
function createAccessToken(payload, role) {
  const expiresIn = `${ACCESS_TOKEN_EXPIRE_HOURS}h`;
  const tokenPayload = {
    ...payload,
    role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * ACCESS_TOKEN_EXPIRE_HOURS
  };
  return jwt.sign(tokenPayload, SECRET_KEY, { algorithm: ALGORITHM });
}

// JWT 토큰 검증
function decodeAccessToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
  } catch (err) {
    throw new Error('유효하지 않은 토큰입니다');
  }
}

// 인증 미들웨어
const authenticateJWT = passport.authenticate('jwt', { session: false });

// 현재 사용자 가져오기
function getCurrentUser(req, res, next) {
  authenticateJWT(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: '인증되지 않은 사용자입니다' });
    }
    next();
  });
}

// 관리자 권한 확인
function getAdminUser(req, res, next) {
  authenticateJWT(req, res, () => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '관리자 권한이 필요합니다' });
    }
    next();
  });
}

module.exports = {
  passport,
  createAccessToken,
  getCurrentUser,
  getAdminUser,
  decodeAccessToken,
  authenticateJWT
};


// const jwt = require('jsonwebtoken');

// const SECRET_KEY = 'your-secret-key-for-jwt';
// const ALGORITHM = 'HS256';
// const ACCESS_TOKEN_EXPIRE_HOURS = 6;

// // JWT 생성
// function createAccessToken(payload, role) {
//   const expiresIn = `${ACCESS_TOKEN_EXPIRE_HOURS}h`;
//   const tokenPayload = { ...payload, role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * ACCESS_TOKEN_EXPIRE_HOURS };
//   return jwt.sign(tokenPayload, SECRET_KEY, { algorithm: ALGORITHM });
// }

// // JWT 디코딩
// function decodeAccessToken(token) {
//   try {
//     return jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
//   } catch (err) {
//     throw new Error('Invalid token');
//   }
// }

// // 현재 사용자 가져오기
// function getCurrentUser(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

//   const token = authHeader.split(' ')[1];
//   try {
//     const payload = decodeAccessToken(token);
//     req.user = { id: payload.sub, role: payload.role };
//     next();
//   } catch (err) {
//     res.status(401).json({ error: 'Invalid token' });
//   }
// }

// // 관리자 권한 확인
// function getAdminUser(req, res, next) {
//   getCurrentUser(req, res, () => {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ error: 'Forbidden' });
//     }
//     next();
//   });
// }

// module.exports = { createAccessToken, getCurrentUser, getAdminUser, decodeAccessToken };
