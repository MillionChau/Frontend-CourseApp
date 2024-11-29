const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const supertest = require('supertest')
const app = require('../../server') // Export app từ file server.js
const Course = require('../../models/Course') // Model Course

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.disconnect()
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  await Course.deleteMany({})
})

describe('Course Added', () => {
  test('Should create a new course successfully', async () => {
    const newCourse = {
      name: 'React JS',
      description: 'Thiết kế giao diện với ReactJS',
      videoId: 'ZTbPz2i2Dms',
      image: 'https://img.youtube.com/vi/ZTbPz2i2Dms/mqdefault.jpg',
      level: 'Trình độ cơ bản',
      energy: 'Học mọi lúc mọi nơi',
      createdAt: '2024-11-20T07:39:02.583+00:00',
    }

    const response = await supertest(app).post('/api/courses/').send(newCourse)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('course')
    expect(response.body.course.name).toBe(newCourse.name)
  })

  test('Should return 400 if name already exists', async () => {
    const existingCourse = {
      name: 'React JS',
      description: 'Thiết kế giao diện với ReactJS',
      videoId: 'ZTbPz2i2Dms',
      image: 'https://img.youtube.com/vi/ZTbPz2i2Dms/mqdefault.jpg',
      level: 'Trình độ cơ bản',
      energy: 'Học mọi lúc mọi nơi',
      createdAt: '2024-11-20T07:39:02.583+00:00',
    }

    await Course.create(existingCourse)

    const response = await supertest(app).post('/api/courses/').send(existingCourse)

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', 'Course already exists')
  })
})

describe('Course Getted', () => {
  test('Should fetch all courses successfully', async () => {
    const course = {
      name: 'React JS',
      description: 'Thiết kế giao diện với ReactJS',
      videoId: 'ZTbPz2i2Dms',
      image: 'https://img.youtube.com/vi/ZTbPz2i2Dms/mqdefault.jpg',
      level: 'Trình độ cơ bản',
      energy: 'Học mọi lúc mọi nơi',
      createdAt: '2024-11-20T07:39:02.583+00:00',
    }

    await Course.create(course)

    const response = await supertest(app).get('/api/courses/')

    expect(response.status).toBe(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0].name).toBe(course.name)
  })

  test('Should handle server errors gracefully', async () => {
    jest.spyOn(Course, 'find').mockImplementationOnce(() => {
      throw new Error('Database query failed')
    })

    const response = await supertest(app).get('/api/courses/')

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', 'Database query failed')
  })
})

describe('Course Edited', () => {
  test('Should fetch a course successfully by ID', async () => {
    const course = await Course.create({
      name: 'Dart Flutter',
      description: 'Phát triển ứng dụng mobile app bằng Dart và Flutter',
      videoId: 'ZTbPz2i2Dms',
      image: 'https://img.youtube.com/vi/ZTbPz2i2Dms/mqdefault.jpg',
      level: 'Trình độ nâng cao',
      energy: 'Học mọi lúc, mọi nơi',
    })

    // Kiểm tra xem khóa học đã được lưu vào cơ sở dữ liệu chưa
    const storedCourse = await Course.findById(course._id)
    expect(storedCourse).toBeDefined()

    const response = await supertest(app).get(`/api/courses/${course._id}/edit`)
    expect(response.status).toBe(200) // Kiểm tra trả về 200 OK
    expect(response.body).toHaveProperty('name', course.name)
  })

  test('Should handle invalid ID gracefully', async () => {
    const invalidId = 'invalid-id'

    const response = await supertest(app).get(`/api/courses/${invalidId}/edit`)
    expect(response.status).toBe(404) // Kiểm tra trả về 404 cho ID không hợp lệ
    expect(response.body).toHaveProperty('message', 'Course not found') // Kiểm tra thông báo lỗi đúng
  })

  test('Should return 404 if course not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId() // ID không tồn tại trong DB

    const response = await supertest(app).get(`/api/courses/${nonExistentId}/edit`)
    expect(response.status).toBe(404) // Kiểm tra trả về 404
    expect(response.body).toHaveProperty('message', 'Course not found') // Kiểm tra thông báo lỗi
  })
})

describe('Course Updated', () => {
  test('Should update a course successfully by ID', async () => {
    const course = await Course.create({
      name: 'Dart Flutter',
      description: 'Phát triển ứng dụng mobile app bằng Dart và Flutter',
      videoId: 'ZTbPz2i2Dms',
      image: 'https://img.youtube.com/vi/ZTbPz2i2Dms/mqdefault.jpg',
      level: 'Trình độ nâng cao',
      energy: 'Học mọi lúc, mọi nơi',
    })

    const updatedCourseData = {
      name: 'Updated Dart Flutter',
      description: 'Cập nhật mô tả khóa học',
      videoId: 'newVideoId',
      image: 'https://example.com/newimage.jpg',
      level: 'Trình độ cơ bản',
      energy: 'Học mọi lúc,mọi nơi',
    }

    const response = await supertest(app)
      .put(`/api/courses/${course._id}`)
      .send(updatedCourseData)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('name', updatedCourseData.name)
    expect(response.body).toHaveProperty('description', updatedCourseData.description)
    expect(response.body).toHaveProperty('videoId', updatedCourseData.videoId)
    expect(response.body).toHaveProperty('image', updatedCourseData.image)
    expect(response.body).toHaveProperty('level', updatedCourseData.level)
    expect(response.body).toHaveProperty('energy', updatedCourseData.energy)
  })

  test('Should return 404 if course not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId() // Tạo ID không tồn tại trong DB

    const updatedCourseData = {
      name: 'Updated Dart Flutter',
      description: 'Cập nhật mô tả khóa học',
      videoId: 'newVideoId',
      image: 'https://example.com/newimage.jpg',
      level: 'Trình độ cơ bản',
      energy: 'Học mọi lúc,mọi nơi',
    }

    const response = await supertest(app)
      .put(`/api/courses/${nonExistentId}`)
      .send(updatedCourseData)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', 'Course not found')
  })

  test('Should return 500 if there is a server error', async () => {
    const invalidId = 'invalid-id' // ID không hợp lệ

    const updatedCourseData = {
      name: 'Updated Dart Flutter',
      description: 'Cập nhật mô tả khóa học',
      videoId: 'newVideoId',
      image: 'https://example.com/newimage.jpg',
      level: 'Trình độ cơ bản',
      energy: 'Học mọi lúc,mọi nơi',
    }

    const response = await supertest(app)
      .put(`/api/courses/${invalidId}`)
      .send(updatedCourseData)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', 'Server Error')
  })
})

describe('Course Deleted', () => {
  test('Should fetch a course successfully by ID', async () => {
    const course = await Course.create({
      name: 'Dart Flutter',
      description: 'Phát triển ứng dụng mobile app bằng Dart và Flutter',
      videoId: 'ZTbPz2i2Dms',
      image: 'https://img.youtube.com/vi/ZTbPz2i2Dms/mqdefault.jpg',
      level: 'Trình độ nâng cao',
      energy: 'Học mọi lúc, mọi nơi',
    })

    const response = await supertest(app).delete(`/api/courses/${course._id}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Course deleted successfully')

    // Kiểm tra xem khóa học đã bị xóa chưa
    const deletedCourse = await Course.findById(course._id)
    expect(deletedCourse).toBeNull()
  })

  test('Should return 404 if course not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId() // ID không tồn tại trong DB

    const response = await supertest(app).delete(`/api/courses/${nonExistentId}`)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', 'Course not found')
  })

  test('Should return 500 if there is a server error', async () => {
    const invalidId = 'invalid-id' // ID không hợp lệ

    const response = await supertest(app).delete(`/api/courses/${invalidId}`)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', 'Internal Server Error')
  })
})