// const express = require('express');
const argon2 = require('argon2');
const { ulid } = require('ulid');
const User = require('../models/userModel');
const { createAccessToken, getCurrentUser, decodeAccessToken } = require('../middlewares/auth');

// const router = express.Router();

class UserService {
  
  async validateUser(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await argon2.verify(user.password, password))) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
    }
    return user;
  }

  // async getAllUsers(token) {
  //   try {
  //     if (!token) {
  //       throw new Error('인증 토큰이 필요합니다.');
  //     }

  //     // 토큰 검증 및 디코딩
  //     const payload = decodeAccessToken(token);

  //     // 사용자 목록 조회
  //     return await User.findAll();
  //   } catch (error) {
  //     throw new Error(`사용자 목록을 가져오는데 실패했습니다: ${error.message}`);
  //   }
  // }

  // getAllUsers 메서드에서 토큰 파라미터 제거
  async getAllUsers() {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'memo', 'is_active', 'created_at', 'updated_at']
      });
      return users;
    } catch (error) {
      throw new Error('사용자 목록을 가져오는데 실패했습니다');
    }
  }

  async getUserById(userId, currentUserId) {
    try {
      const user = await User.findOne({
        where: { id: userId }
      });
      if (!user) return null;
      if (currentUserId !== user.id) throw new Error('권한이 없습니다.');
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getMyInfo(userId) {
    try {
      const user = await User.findOne({
        where: { id: userId },
        attributes: { exclude: ['password'] } // 비밀번호 필드 제외
      });
      if (!user) return null;
      return user;
    } catch (error) {
      throw error;
    }
  }


  async login(email, password) {
    try {
      const user = await User.findOne({ 
        where: { email } 
      });
      
      if (!user || !(await argon2.verify(user.password, password))) {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      }

      const token = createAccessToken({ sub: user.id }, 'USER');
      return { access_token: token, token_type: 'bearer' };
    } catch (error) {
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const existingUser = await User.findOne({ 
        where: { email: userData.email } 
      });
      
      if (existingUser) {
        throw new Error('이미 존재하는 사용자입니다.');
      }

      const hashedPassword = await argon2.hash(userData.password);
      
      const newUser = await User.create({
        id: ulid(),
        ...userData,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      });

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId, userData, currentUserId) {
    try {
      const user = await User.findOne({
        where: { id: userId }
      });
      
      if (!user) return null;
      if (currentUserId !== user.id) throw new Error('권한이 없습니다.');

      if (userData.password) {
        userData.password = await argon2.hash(userData.password);
      }

      const updatedData = {
        ...userData,
        updated_at: new Date()
      };
      
      await user.update(updatedData);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId, currentUserId) {
    try {
      const user = await User.findOne({
        where: { id: userId }
      });
      
      if (!user) return null;
      if (currentUserId !== user.id) throw new Error('권한이 없습니다.');

      await user.destroy();
      return user;
    } catch (error) {
      throw error;
    }
  }
}

const userService = new UserService();


module.exports = userService;