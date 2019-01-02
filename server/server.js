require('./config/config')

const express = require('express')
const bodyParcer = require('body-parser')
const { ObjectID } = require('mongodb')
const _ = require('lodash')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')
// const { authenticate } = require('./middleware/authenticate')

const app = express()
const port = process.env.PORT

app.use(bodyParcer.json())

const authenticate = async (request, response, next) => {
    try {
        const token = request.header('x-auth')
        const user = await User.findByToken(token)
        if (!user) {
            return Promise.reject()
        }
        request.user = user
        request.token = token
        next()
    } catch (e) {
        response.status(401).send()
    }
}

app.post('/todos', authenticate, async (request, response) => {
    try {
        const todo = new Todo({
            text: request.body.text,
            _creator: request.user._id
        })
        const doc = await todo.save()
        response.send(doc)
    } catch (e) {
        response.status(400).send(e)
    }
})

app.get('/todos', authenticate, async (request, response) => {
    try {
        const todos = await Todo.find({ _creator: request.user._id })
        response.send({ todos })
    } catch (e) {
        response.status(400).send(e)
    }
})

app.get('/todos/:id', authenticate, async (request, response) => {
    try {
        const id = request.params.id
        if (!ObjectID.isValid(id)) return response.status(404).send()
        const todo = await Todo.findOne({
            _id: id,
            _creator: request.user._id
        })
        if (!todo) return response.status(404).send()
        response.send({ todo })
    } catch (e) {
        response.status(400).send(e)
    }
})

app.delete('/todos/:id', authenticate, async (request, response) => {
    try {
        const id = request.params.id
        if (!ObjectID.isValid(id)) {
            return response.status(404).send()
        }
        const todo = await Todo.findOneAndRemove({
            _id: id,
            _creator: request.user._id
        })
        if (!todo) return response.status(404).send()
        response.send({ todo })
    } catch (e) {
        response.status(400).send(e)
    }
})

app.patch('/todos/:id', authenticate, async (request, response) => {
    try {
        const id = request.params.id
        const body = _.pick(request.body, ['text', 'completed'])

        if (!ObjectID.isValid(id)) {
            return response.status(404).send()
        }

        if (_.isBoolean(body.completed) && body.completed) {
            body.completedAt = new Date().getTime()
        } else {
            body.completedAt = null,
                body.completed = false
        }
        const todo = await Todo.findOneAndUpdate({
            _id: id,
            _creator: request.user.id
        }, { $set: body }, { new: true })
        if (!todo) return response.status(404).send()
        response.send({ todo })
    } catch (e) {
        response.status(400).send()
    }
})

// Users

app.post('/users', async (request, response) => {
    try {
        const body = _.pick(request.body, ['email', 'password'])
        const user = new User(body)
        await user.save()
        const token = await user.generateAuthToken()
        response.header('x-auth', token).send(user)
    } catch (e) {
        response.status(400).send(e)
    }
})

app.post('/users/login', async (request, response) => {
    try {
        const body = _.pick(request.body, ['email', 'password'])
        const user = await User.findByCredentials(body.email, body.password)
        const token = await user.generateAuthToken()
        response.header('x-auth', token).send(user)
    } catch (e) {
        response.status(400).send(e)
    }
})

app.get('/users/me', authenticate, (request, response) => {
    response.send(request.user)
})

app.delete('/users/me/token', authenticate, async (request, response) => {
    try {
        await request.user.removeToken(request.token)
        response.status(200).send()
    } catch (e) {
        response.status(400).send()
    }
})

app.listen(port, () => {
    console.log('Started on port ' + port)
})

module.exports = { app }