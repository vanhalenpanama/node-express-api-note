# Node.js Express 게시글 관리 API 서비스

Node.js와 Express.js를 활용하여 개발된 RESTful API 서비스입니다. 사용자 인증과 게시글 관리 기능을 제공하며, 보안성과 데이터 무결성을 고려한 설계가 특징입니다.

## 주요 기능

보안 및 인증
- JWT(JSON Web Token)를 활용한 사용자 인증 시스템 구현
- Access Token과 Refresh Token 이중 토큰 체계 적용
- CSRF(Cross-Site Request Forgery) 공격 방지를 위한 보안 계층 구현

API 엔드포인트
- 사용자 관리: 회원가입, 로그인, 프로필 조회/수정
- 게시글 관리: CRUD 작업 구현
- 태그 시스템: 게시글 분류 및 관리

데이터 관리
- 사용자별 게시글 접근 권한 관리
- 트랜잭션 처리를 통한 데이터 일관성 보장

## 기술 스택

### 백엔드
Node.js
Express.js
Passport.js
JWT
Sequelize ORM

### 개발 도구
Git
Swagger (API 문서화)
Postman (API 테스트)

## 주요 구현 사항

보안 강화
```javascript
const jwtOptions = {
    jwtFromRequest: jwtFromHeader,
    secretOrKey: SECRET_KEY,
    algorithms: [ALGORITHM]
};
```
CSRF 보호
```javascript
router.use('/users', (req, res, next) => {
    if (req.method === 'GET') {
        return validateCsrfToken(req, res, next);
    }
    next();
}, userController);
```

## API 문서
Swagger UI를 통해 API 문서를 제공하며, 로컬 환경에서 다음 주소로 접근 가능합니다.
http://localhost:3000/api-docs

## 특징
- 보안성: JWT 토큰 기반 인증과 CSRF 보호를 통한 견고한 보안 구현
- 확장성: 모듈화된 구조로 새로운 기능 추가가 용이
- 유지보수성: 명확한 코드 구조와 문서화
- 데이터 무결성: 트랜잭션 처리를 통한 안정적인 데이터 관리
