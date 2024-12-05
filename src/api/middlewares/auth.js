const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const SECRET_KEY = 'your-secret-key-for-jwt';
const REFRESH_SECRET_KEY = 'your-refresh-secret-key';
const ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRE = '15m';
const REFRESH_TOKEN_EXPIRE = '7d';

const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies['access_token'];
  }
  return null;
};

const jwtOptions = {
  jwtFromRequest: cookieExtractor,
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

function setCookies(res, accessToken, refreshToken, csrfToken) {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15분
  });
  
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
  });

  // CSRF 토큰을 _csrf 쿠키로 저장
  // res.cookie('_csrf', csrfToken, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'lax',
  //   maxAge: 15 * 60 * 1000
  // });

  // 클라이언트에서 사용할 CSRF 토큰을 XSRF-TOKEN으로 저장
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // maxAge: 15 * 60 * 1000
  });
}

module.exports = {
  passport,
  createAccessToken,
  createRefreshToken,
  decodeAccessToken,
  decodeRefreshToken,
  getCurrentUser,
  setCookies
};
