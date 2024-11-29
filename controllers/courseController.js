const Course = require('../models/Course')

class CourseController {
  // Lấy danh sách khóa học
  async getCourses(req, res, next) {
  try {
    const courses = await Course.find()
    res.status(200).json(courses)
  } catch (error) {
    res.status(500).json({ message: error.message })
    next(error)
  }
}

// Thêm khóa học mới
async  addCourse(req, res, next) {
  try {
    const { name } = req.body

    const existingCourse = await Course.findOne({ name })
    if (existingCourse) {
      return res.status(400).json({ message: 'Course already exists' })
    }

    const newCourse = new Course(req.body)
    await newCourse.save()

    res.status(201).json({ course: newCourse })
  } catch (error) {
    res.status(500).json({ message: error.message })
    next(error)
  }
}

// Đên trang chỉnh sửa khoá học
async editCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    res.status(200).json(course)
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Course not found' })
    }
    res.status(500).json({ message: err.message })
    next(err)
  }
}


// Chỉnh sửa khoá học
async update(req, res, next) {
  try {
    const { id } = req.params
    const { name, description, videoId, image, level, energy } = req.body
    
    const course = await Course.findById(id)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    // Cập nhật thông tin khóa học
    course.name = name
    course.description = description
    course.videoId = videoId
    course.image = image
    course.level = level
    course.energy = energy

    await course.save()
    res.json(course) // Trả về khóa học đã được cập nhật
  } catch (error) {
    res.status(500).json({ message: 'Server Error' })
    next(error)
  }
}

// Xoá khoá học
async delete(req, res, next) {
  try {
    const { id } = req.params
    const deletedCourse = await Course.findByIdAndDelete(id)

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' })
    }

    res.status(200).json({ message: 'Course deleted successfully', course: deletedCourse })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
    next(error)
  }
}
}


module.exports = new CourseController
