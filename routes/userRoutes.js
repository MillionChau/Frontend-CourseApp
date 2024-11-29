const express = require('express')
const { registerUser, loginUser } = require('../controllers/userController')
const router = express.Router()

router.post('/register', registerUser) // Đăng ký
router.post('/login', loginUser)      // Đăng nhập

module.exports = router
