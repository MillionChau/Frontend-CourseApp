const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan')
const userRoutes = require('./routes/userRoutes')
const courseRoutes = require('./routes/courseRoutes')
const db = require('./config/db')

dotenv.config()

const app = express()
const port = 5000

db.connect()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/users', userRoutes)
app.use('/api/courses', courseRoutes)

// Logger HTTP
app.use(morgan('combined'))

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => console.log(`Server is running on port ${port}`))
}

module.exports = app