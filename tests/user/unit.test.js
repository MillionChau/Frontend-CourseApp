const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const supertest = require('supertest')
const app = require('../../server') // Export app từ file server.js
const User = require('../../models/User') // Model User

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create() // Tạo MongoDB giả
  const uri = mongoServer.getUri()
  await mongoose.disconnect() // Đảm bảo đóng mọi kết nối cũ
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }) // Kết nối mới
})

afterAll(async () => {
  await mongoose.disconnect() // Đóng kết nối MongoDB
  await mongoServer.stop() // Dừng MongoDB giả
})

afterEach(async () => {
  await User.deleteMany({}) // Xoá dữ liệu sau mỗi bài test
})

describe('User API Tests', () => {
  describe('User Registration', () => {
    test('Should register a new user successfully', async () => {
      const newUser = {
        username: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
      }

      const response = await supertest(app).post('/api/users/register').send(newUser)

      expect(response.status).toBe(201) // HTTP Created
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(newUser.email)
    })

    test('Should return 400 if email already exists', async () => {
      const existingUser = {
        username: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
      }

      await User.create(existingUser) // Thêm user vào database trước

      const response = await supertest(app).post('/api/users/register').send(existingUser)

      expect(response.status).toBe(400) // HTTP Bad Request
      expect(response.body.message).toBe('User already exists') // Thông báo lỗi
    })
  })

  describe('User Login', () => {
    test('Should login successfully with valid credentials', async () => {
      const user = {
        username: 'John Smith',
        email: 'john.smith@example.com',
        password: 'password123',
        role: 'user',
      }

      // Tạo user trong database
      await User.create(user)

      const response = await supertest(app).post('/api/users/login').send({
        email: user.email,
        password: user.password,
      })

      expect(response.status).toBe(200) // HTTP OK
      expect(response.body).toHaveProperty('token')
    })

    test('Should return 401 for invalid password', async () => {
      const user = {
        username: 'John Smith',
        email: 'john.smith@example.com',
        password: 'password123',
        role: 'user',
      }

      await User.create(user) // Thêm user vào database

      const response = await supertest(app).post('/api/users/login').send({
        email: user.email,
        password: 'wrongpassword', // Sai mật khẩu
      })

      expect(response.status).toBe(401) // HTTP Unauthorized
      expect(response.body.message).toBe('Invalid credentials')
    })

    test('Should return 404 for non-existent user', async () => {
      const response = await supertest(app).post('/api/users/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      })

      expect(response.status).toBe(404) // HTTP Not Found
      expect(response.body.message).toBe('User not found')
    })
  })
})
