const express = require('express')
const courseController = require('../controllers/courseController')
const router = express.Router()

router.get('/', courseController.getCourses)  // Lấy danh sách khóa học
router.post('/', courseController.addCourse) // Thêm khóa học mới
router.get('/:id/edit', courseController.editCourse) // Chỉnh sửa khoá học
router.put('/:id', courseController.update)
router.delete('/:id', courseController.delete)

module.exports = router
