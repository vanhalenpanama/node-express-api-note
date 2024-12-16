const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const userService = require('../services/userService');
const {
    getCurrentUser,
    createAccessToken,
    createRefreshToken,
    decodeRefreshToken
} = require('../middlewares/auth');
const errorHandler = require('../middlewares/errorHandler')

// CSRF 보호 설정
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await userService.validateUser(email, password);
        
        const accessToken = createAccessToken({ sub: user.id }, 'USER');
        const refreshToken = createRefreshToken({ sub: user.id }, 'USER');
        
        // CSRF 토큰 생성
        const csrfToken = csrfProtection(req, res, () => req.csrfToken());
        
        res.json({
            message: '로그인 성공',
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            csrf_token: csrfToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', (req, res, next) => {
    try {
        res.json({ message: '로그아웃 성공' });
    } catch (error) {
        next(error);
    }
});

router.post('/refresh', async (req, res, next) => {
    try {
        const refreshToken = req.headers.authorization.split(' ')[1];
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
        
        res.json({
            message: '토큰 갱신 성공',
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            token_type: 'Bearer'
        });
    } catch (error) {
        next(error);
    }
});

router.get('/me', getCurrentUser, async (req, res, next) => {
    try {
        const user = await userService.getMyInfo(req.user.id);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다');
        }
        res.json(user);
    } catch (error) {
        errorHandler(res, error, 404);
    }
});

router.get('/', getCurrentUser, async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', getCurrentUser, async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id, req.user.id);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다');
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
});

router.patch('/:id', getCurrentUser, async (req, res, next) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body, req.user.id);
        if (!updatedUser) {
            throw new Error('사용자를 찾을 수 없습니다');
        }
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', getCurrentUser, async (req, res, next) => {
    try {
        const deletedUser = await userService.deleteUser(req.params.id, req.user.id);
        if (!deletedUser) {
            throw new Error('사용자를 찾을 수 없습니다');
        }
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
