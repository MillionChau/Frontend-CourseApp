const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const supertest = require('supertest')
const app = require('../../server') 
const User = require('../../models/User')

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.disconnect()
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  await User.deleteMany({})
})

describe('POST /api/users/register', () => {
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

  describe('GET /api/users/login', () => {
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
