const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { getCurrentUser } = require('../middlewares/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
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