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

const jwtFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
  }
  return null;
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
  getCurrentUser
};
