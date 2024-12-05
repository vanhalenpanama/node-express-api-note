const express = require('express');
const csrf = require('csurf');
const router = express.Router();

// const csrfProtection = csrf({
//   cookie: {
//     key: '_csrf',
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'lax'
//   },
//   value: (req) => {
//     return req.headers['x-xsrf-token'];
//   }
// });

const csrfProtection = csrf({
  cookie: true,
  value: (req) => {
    return req.headers['x-xsrf-token'] || req.cookies['XSRF-TOKEN'];
  }
});

// CSRF 토큰 발급 엔드포인트를 라우터 최상단에 배치
router.get('/users/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const userController = require('./controllers/userController');
const noteController = require('./controllers/noteController');


// router.use('/users', userController);
// router.post('/users/login', userController);

// CSRF 보호가 필요한 라우트에만 적용
router.use('/users', (req, res, next) => {
  // login과 logout 경로는 CSRF 보호에서 제외
  if (req.path === '/login' || req.path === '/logout') {
    next();
  } else {
    csrfProtection(req, res, next);
  }
}, userController);

router.use('/notes', noteController);

module.exports = router;
