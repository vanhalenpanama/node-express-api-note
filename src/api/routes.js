const express = require('express');
const csrf = require('csurf');
const router = express.Router();

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
});

// CSRF 토큰 검증 미들웨어
const validateCsrfToken = (req, res, next) => {
  console.log('요청 헤더 전체:', req.headers);
  console.log('요청 헤더 csrf token:', req.headers['x-csrf-token']);
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


const userController = require('./controllers/userController');
const noteController = require('./controllers/noteController');


// CSRF 보호가 필요한 라우트에만 적용
// router.use('/users', (req, res, next) => {
//   if (req.path === '/login' || req.path === '/logout') {
//     next();
//   } else {
//     // csrfProtection(req, res, next);
//     return validateCsrfToken(req, res, next);
//   }
// }, userController);

router.use('/users', (req, res, next) => {
  if (req.method === 'GET') {
      return validateCsrfToken(req, res, next);
  }
  next();
}, userController);


router.use('/notes', noteController);
// router.use('/notes', csrfProtection, noteController);


module.exports = router;
