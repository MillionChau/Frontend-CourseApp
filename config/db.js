const mongoose = require('mongoose')

async function connect() {
  try {
    await mongoose.connect('mongodb://localhost:27017/my_course')
    console.log('Connect Successfully!')
  } catch (error) {
    console.error(error)
  }
}

module.exports = { connect }