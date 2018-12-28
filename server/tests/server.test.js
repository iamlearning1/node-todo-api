const request = require('supertest')
const expect = require('expect')
const { ObjectID } = require('mongodb')

const { app } = require('./../server')
const { Todo } = require('./../models/todo')
const { User } = require('./../models/user')
const { todos, populateTodos, users, populateUsers } = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        const text = 'Some text'

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({ text })
            .expect(200)
            .expect((response) => {
                expect(response.body.text).toBe(text)
            })
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1)
                    expect(todos[0].text).toBe(text)
                    done()
                }).catch(error => done(error))
            })
    })

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((error, response) => {
                if (error) return done(error)
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2)
                    done()
                }).catch(error => done(error))
            })
    })
})

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((response) => {
                expect(response.body.todos.length).toBe(1)
            })
            .end(done)
    })
})

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(response => {
                expect(response.body.todo.text).toBe(todos[0].text)
            })
            .end(done)
    })

    it('should not return a todo created by other user', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return 404 if no todo found', (done) => {
        const hexId = new ObjectID().toHexString()
        request(app)
            .get(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/1212')
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
})

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        const hexId = todos[1]._id.toHexString()
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .expect((response) => {
                expect(response.body.todo._id).toBe(hexId)
            })
            .end((error, response) => {
                if (error) return done()
                Todo.findById(hexId).then(todo => {
                    expect(todo).toBeFalsy()
                    done()
                }).catch(error => done(error))
            })
    })

    it('should not remove a todo', (done) => {
        const hexId = todos[0]._id.toHexString()
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end((error, response) => {
                if (error) return done()
                Todo.findById(hexId).then(todo => {
                    expect(todo).toBeTruthy()
                    done()
                }).catch(error => done(error))
            })
    })

    it('should return 404 if todo not found', (done) => {
        const hexId = new ObjectID().toHexString()
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return 404 if object id is invalid', (done) => {
        request(app)
            .delete('/todos/1212')
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done)
    })
})

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        const id = todos[0]._id.toHexString()
        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                text: 'abc',
                completed: true
            })
            .expect(200)
            .expect(response => {
                expect(response.body.todo.text).toBe('abc')
                expect(response.body.todo.completed).toBe(true)
                // expect(response.body.todo.completedAt).toBeA('number')
                expect(typeof response.body.todo.completedAt).toBe('number')
            })
            .end(done)
    })

    it('should not update the todo of other user', (done) => {
        const id = todos[0]._id.toHexString()
        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                text: 'abc',
                completed: true
            })
            .expect(404)
            .end(done)
    })

    it('should clear completedAt when todo is not completed', (done) => {
        const id = todos[1]._id.toHexString()
        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                text: 'xyz',
                completed: false
            })
            .expect(200)
            .expect(response => {
                expect(response.body.todo.text).toBe('xyz')
                expect(response.body.todo.completed).toBe(false)
                expect(response.body.todo.completedAt).toBeFalsy()
            })
            .end(done)
    })
})

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((response) => {
                expect(response.body._id).toBe(users[0]._id.toHexString())
                expect(response.body.email).toBe(users[0].email)
            })
            .end(done)
    })

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(response => {
                expect(response.body).toEqual({})
            })
            .end(done)
    })
})

describe('POST /users', () => {
    it('should create a user', (done) => {
        const email = 't11est@test.com'
        const password = '122gdd56'

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect(response => {
                expect(response.headers['x-auth']).toBeTruthy()
                expect(response.body._id).toBeTruthy()
                expect(response.body.email).toBe(email)
            })
            .end(error => {
                if (error) return done(error)
                User.findOne({ email }).then(user => {
                    expect(user).toBeTruthy()
                    expect(user.password).not.toBe(password)
                    done()
                }).catch(error => done(error))
            })
    })

    it('should return validation errors if request is invalid', (done) => {
        const email = 'dfdds'
        const password = 'dlf'

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end(done)
    })

    it('should not create user if email is in use', (done) => {
        const email = 'test@test.com'
        const password = '12356577d'

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end(done)
    })
})

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect(response => {
                expect(response.header['x-auth']).toBeTruthy()
            })
            .end((error, response) => {
                if (error) return done(error)
                User.findById(users[1]._id).then(user => {
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: response.headers['x-auth']
                    })
                    done()
                }).catch(error => done(error))
            })
    })

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: 'users[1].password'
            })
            .expect(400)
            .expect(response => {
                expect(response.header['x-auth']).toBeFalsy()
            })
            .end((error, response) => {
                if (error) return done(error)
                User.findById(users[1]._id).then(user => {
                    expect(user.tokens.length).toBe(1)
                    done()
                }).catch(error => done(error))
            })
    })
})

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((error, response) => {
                if (error) return done(error)
                User.findById(users[0]._id).then(user => {
                    expect(user.tokens.length).toBe(0)
                    done()
                }).catch(error => done(error))
            })
    })
})