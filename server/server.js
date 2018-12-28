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

app.get('/todos', (request, response) => {
    Todo.find().then(todos => {
        response.send({ todos })
    }).catch(error => {
        response.status(400).send(error)
    })
})

app.get('/todos/:id', (request, response) => {
    const id = request.params.id
    if (!ObjectID.isValid(id)) {
        return response.status(404).send()
    }
    Todo.findById(id).then(todo => {
        if (!todo) return response.status(404).send()
        response.send({ todo })
    }).catch(error => {
        response.status(400).send()
    })
})

app.delete('/todos/:id', (request, response) => {
    const id = request.params.id
    if (!ObjectID.isValid(id)) {
        return response.status(404).send()
    }
    Todo.findByIdAndRemove(id).then(todo => {
        if (!todo) return response.status(404).send()
        response.send({ todo })
    }).catch(error => {
        response.status(400).send()
    })
})

app.patch('/todos/:id', (request, response) => {
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

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then(todo => {
        if (!todo) return response.status(404).send()
        response.send({ todo })
    }).catch(error => {
        response.status(400).send()
    })
})

// Users

app.post('/users', (request, response) => {
    const body = _.pick(request.body, ['email', 'password'])
    const user = new User(body)
    user.save().then(() => {
        return user.generateAuthToken()
    }).then(token => {
        response.header('x-auth', token).send(user)
    }).catch(error => {
        response.status(400).send(error)
    })
})

const authenticate = (request, response, next) => {
    const token = request.header('x-auth')
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject()
        }
        request.user = user
        request.token = token
        next()
    }).catch((error) => {
        response.status(401).send()
    })
}

app.get('/users/me', authenticate, (request, response) => {
    response.send(request.user)
})

app.listen(port, () => {
    console.log('Started on port ' + port)
})

module.exports = { app }