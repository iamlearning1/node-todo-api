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

app.post('/todos', authenticate, (request, response) => {
    const todo = new Todo({
        text: request.body.text,
        _creator: request.user._id
    })

    todo.save().then((doc) => {
        response.send(doc)
    }).catch((error) => {
        response.status(400).send(error)
    })
})

app.get('/todos', authenticate, (request, response) => {
    Todo.find({ _creator: request.user._id }).then(todos => {
        response.send({ todos })
    }).catch(error => {
        response.status(400).send(error)
    })
})

app.get('/todos/:id', authenticate, (request, response) => {
    const id = request.params.id
    if (!ObjectID.isValid(id)) {
        return response.status(404).send()
    }
    Todo.findOne({
        _id: id,
        _creator: request.user._id
    }).then(todo => {
        if (!todo) return response.status(404).send()
        response.send({ todo })
    }).catch(error => {
        response.status(400).send()
    })
})

app.delete('/todos/:id', authenticate, (request, response) => {
    const id = request.params.id
    if (!ObjectID.isValid(id)) {
        return response.status(404).send()
    }
    Todo.findOneAndRemove({
        _id: id,
        _creator: request.user._id
    }).then(todo => {
        if (!todo) return response.status(404).send()
        response.send({ todo })
    }).catch(error => {
        response.status(400).send()
    })
})

app.patch('/todos/:id', authenticate, (request, response) => {
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

    Todo.findOneAndUpdate({
        _id: id,
        _creator: request.user.id
    }, { $set: body }, { new: true }).then(todo => {
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

app.post('/users/login', (request, response) => {
    const body = _.pick(request.body, ['email', 'password'])

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then(token => {
            response.header('x-auth', token).send(user)
        })
    }).catch(error => {
        response.status(400).send(error)
    })
})

app.get('/users/me', authenticate, (request, response) => {
    response.send(request.user)
})

app.delete('/users/me/token', authenticate, (request, response) => {
    request.user.removeToken(request.token).then(() => {
        response.status(200).send()
    }, () => {
        response.status(400).send()
    })
})

app.listen(port, () => {
    console.log('Started on port ' + port)
})

module.exports = { app }