const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const csrf = require('csurf');

const SECRET_KEY = 'your-secret-key-for-jwt';
const REFRESH_SECRET_KEY = 'your-refresh-secret-key';
const ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRE = '15m';
const REFRESH_TOKEN_EXPIRE = '7d';

const jwtFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
  }
  return null;
};

const csrfProtection = csrf({
  cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
  }
});

const validateCsrfToken = (req, res, next) => {
  const origin = req.get('origin');
  const host = req.get('host');

  console.log('origin:', origin);
  console.log('host:', host);

  console.log('요청 헤더 전체:', req.headers);
  console.log('요청 헤더 csrf token:', req.headers['x-csrf-token']);


  // swagger, postman 테스트 시 CSRF 토큰 검증 제외 
  if (origin === undefined && host === 'localhost:3000') 
  {
    return next();
  }  

  // 프론트엔드 연동 시 CSRF 토큰 검증 
  const csrfToken = req.headers['x-csrf-token'] || req.query._csrf;
  if (!csrfToken) {
    return res.status(403).json({ error: 'CSRF 토큰이 누락되었습니다.' });
  }
  
  csrfProtection(req, res, (err) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 CSRF 토큰입니다.' });
    }
    console.log('토큰 통과');
    next();
  });
};


const jwtOptions = {
  jwtFromRequest: jwtFromHeader,
  secretOrKey: SECRET_KEY,
  algorithms: [ALGORITHM]
};

passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await User.findOne({ where: { id: jwtPayload.sub } });
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

function createAccessToken(payload, role) {
  return jwt.sign(
    { ...payload, role },
    SECRET_KEY,
    { algorithm: ALGORITHM, expiresIn: ACCESS_TOKEN_EXPIRE }
  );
}

function createRefreshToken(payload, role) {
  return jwt.sign(
    { ...payload, role },
    REFRESH_SECRET_KEY,
    { algorithm: ALGORITHM, expiresIn: REFRESH_TOKEN_EXPIRE }
  );
}

function decodeAccessToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    throw new Error('유효하지 않은 액세스 토큰입니다');
  }
}

function decodeRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET_KEY);
  } catch (err) {
    throw new Error('유효하지 않은 리프레시 토큰입니다');
  }
}

function getCurrentUser(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return res.status(401).json({ error: '인증 오류가 발생했습니다' });
    if (!user) return res.status(401).json({ error: '인증되지 않은 사용자입니다' });
    req.user = user;
    next();
  })(req, res, next);
}


module.exports = {
  passport,
  createAccessToken,
  createRefreshToken,
  decodeAccessToken,
  decodeRefreshToken,
  getCurrentUser,
  csrfProtection,
  validateCsrfToken
};
