const express = require('express')
const bodyParcer = require('body-parser')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')

const app = express()

app.use(bodyParcer.json())

app.post('/todos', (request, response) => {
    const todo = new Todo({
        text: request.body.text
    })

    todo.save().then((doc) => {
        response.send(doc)
    }).catch((error) => {
        response.status(400).send(error)
    })
})

app.listen(3000, () => {
    console.log('Started on port 3000')
})

module.exports = { app }