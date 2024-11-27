const express = require('express');
const router = express.Router();
const noteService = require('../services/noteService');
const { getCurrentUser } = require('../middlewares/auth');


// 노트 생성
router.post('/', getCurrentUser, async (req, res) => {
    try {
        const { title, content, memo_date, tags } = req.body;
        const note = await noteService.createNote(
            req.user.id,
            title,
            content,
            memo_date,
            tags
        );
        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 모든 노트 조회
router.get('/', getCurrentUser, async (req, res) => {
    try {
        const notes = await noteService.getNotes(req.user.id);
        res.json(notes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 특정 노트 조회
router.get('/:id', getCurrentUser, async (req, res) => {
    try {
        const note = await noteService.getNoteById(req.params.id, req.user.id);
        res.json(note);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// 노트 수정
router.put('/:id', getCurrentUser, async (req, res) => {
    try {
        const { title, content, memo_date, tags } = req.body;
        const note = await noteService.updateNote(
            req.params.id,
            req.user.id,
            title,
            content,
            memo_date,
            tags
        );
        res.json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 노트 삭제
router.delete('/:id', getCurrentUser, async (req, res) => {
    try {
        const result = await noteService.deleteNote(req.params.id, req.user.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;