const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const userService = require('../services/userService');
const { 
  getCurrentUser, 
  createAccessToken, 
  createRefreshToken,
  decodeRefreshToken,
  setCookies 
} = require('../middlewares/auth');

// CSRF 보호 설정
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
});


// CSRF 토큰을 클라이언트에 제공하는 엔드포인트
router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.validateUser(email, password);
    
    const accessToken = createAccessToken({ sub: user.id }, 'USER');
    const refreshToken = createRefreshToken({ sub: user.id }, 'USER');
    
    // CSRF 토큰 생성 및 설정
    csrfProtection(req, res, () => {
      const csrfToken = req.csrfToken();
      setCookies(res, accessToken, refreshToken, csrfToken);
      
      res.json({
        message: '로그인 성공',
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },csrfToken: csrfToken
      });
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await userService.validateUser(email, password);
    
//     const accessToken = createAccessToken({ sub: user.id }, 'USER');
//     const refreshToken = createRefreshToken({ sub: user.id }, 'USER');
    
//     // CSRF 토큰 생성
//     csrfProtection(req, res, () => {
//       const csrfToken = req.csrfToken();
      
//       // CSRF 토큰을 포함하여 쿠키 설정
//       setCookies(res, accessToken, refreshToken, csrfToken);
      
//       res.json({
//         message: '로그인 성공',
//         access_token: accessToken,
//         refresh_token: refreshToken,
//         token_type: 'Bearer',
//         user: {
//           id: user.id,
//           email: user.email,
//           name: user.name
//         },
//         csrfToken: csrfToken
//       });
//     });
//   } catch (error) {
//     res.status(401).json({ error: error.message });
//   }
// });


router.post('/logout', (req, res) => {
  res.cookie('access_token', '', { maxAge: 0 });
  res.cookie('refresh_token', '', { maxAge: 0 });
  res.json({ message: '로그아웃 성공' });
});


router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다');
    }

    const decoded = decodeRefreshToken(refreshToken);
    const user = await userService.getUserById(decoded.sub);
    
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    const newAccessToken = createAccessToken({ sub: user.id }, 'USER');
    const newRefreshToken = createRefreshToken({ sub: user.id }, 'USER');
    
    setCookies(res, newAccessToken, newRefreshToken);
    
    res.json({ message: '토큰 갱신 성공' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// 현재 로그인한 사용자 정보 조회
router.get('/me', getCurrentUser, async (req, res) => {
  try {
    const user = await userService.getMyInfo(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 사용자 목록 조회 (JWT 인증 추가)
router.get('/', async (req, res) => {
  try {
    // 요청 헤더에서 Authorization 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];

    // UserService의 getAllUsers 메서드 호출
    const users = await userService.getAllUsers(token);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', getCurrentUser, async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user.id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json(user);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
});

router.patch('/:id', getCurrentUser, async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body, req.user.id);
    if (!updatedUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

router.delete('/:id', getCurrentUser, async (req, res) => {
  try {
    const deletedUser = await userService.deleteUser(req.params.id, req.user.id);
    if (!deletedUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

module.exports = router;