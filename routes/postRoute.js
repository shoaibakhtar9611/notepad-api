const express = require('express');

const router = express.Router();

const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

router.post('/newNote', authController.protect, postController.createNote);
router.get('/getNotes', authController.protect, postController.getNotes);
router.put('/editNote/:noteID', authController.protect, postController.editNote);
router.delete('/deleteNote/:noteID', authController.protect, postController.deleteNote);

module.exports = router;