const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your-secret-key-for-jwt';
const ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRE_HOURS = 6;

// JWT 생성
function createAccessToken(payload, role) {
  const expiresIn = `${ACCESS_TOKEN_EXPIRE_HOURS}h`;
  const tokenPayload = { ...payload, role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * ACCESS_TOKEN_EXPIRE_HOURS };
  return jwt.sign(tokenPayload, SECRET_KEY, { algorithm: ALGORITHM });
}

// JWT 디코딩
function decodeAccessToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
  } catch (err) {
    throw new Error('Invalid token');
  }
}

// 현재 사용자 가져오기
function getCurrentUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = decodeAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// 관리자 권한 확인
function getAdminUser(req, res, next) {
  getCurrentUser(req, res, () => {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  });
}

module.exports = { createAccessToken, getCurrentUser, getAdminUser, decodeAccessToken };
