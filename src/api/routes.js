const express = require('express');
const csrf = require('csurf');
const router = express.Router();

// const csrfProtection = csrf({
//   cookie: true,
//   value: (req) => {
//     return req.headers['x-xsrf-token'] || req.cookies['XSRF-TOKEN'];
//   }
// });

const csrfProtection = csrf({
  cookie: true
});

// CSRF 토큰 발급 엔드포인트를 라우터 최상단에 배치
// router.get('/users/csrf-token', csrfProtection, (req, res) => {
//   res.json({ csrfToken: req.csrfToken() });
// });

router.get('/users/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const userController = require('./controllers/userController');
const noteController = require('./controllers/noteController');


// CSRF 보호가 필요한 라우트에만 적용
// router.use('/users', (req, res, next) => {
//   if (req.path === '/login' || req.path === '/logout') {
//     next();
//   } else {
//     csrfProtection(req, res, next);
//   }
// }, userController);
router.use('/users', (req, res, next) => {
  // GET 요청에만 CSRF 보호 적용
  if (req.method === 'GET') {
      return csrfProtection(req, res, next);
  }
  // POST, PATCH, DELETE는 CSRF 보호 없이 통과
  next();
}, userController);


// router.use('/notes', noteController);
// notes 라우트에 CSRF 보호 적용
router.use('/notes', csrfProtection, noteController);


module.exports = router;
