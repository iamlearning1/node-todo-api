const request = require('supertest')
const expect = require('expect')
const { ObjectID } = require('mongodb')

const { app } = require('./../server')
const { Todo } = require('./../models/todo')

const todos = [
    {
        _id: new ObjectID(),
        text: 'First Test'
    }, {
        _id: new ObjectID(),
        text: 'second test',
        completed: true,
        completedAt: 6549756497
    }
]

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
    }).then(() => done())
})

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        const text = 'Some text'

        request(app)
            .post('/todos')
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
            .expect(200)
            .expect((response) => {
                expect(response.body.todos.length).toBe(2)
            })
            .end(done)
    })
})

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect(response => {
                expect(response.body.todo.text).toBe(todos[0].text)
            })
            .end(done)
    })

    it('should return 404 if no todo found', (done) => {
        const hexId = new ObjectID().toHexString()
        request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done)
    })

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/1212')
            .expect(404)
            .end(done)
    })
})

describe('delete /todos/:id', () => {
    it('should remove a todo', (done) => {
        const hexId = todos[1]._id.toHexString()
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((response) => {
                expect(response.body.todo._id).toBe(hexId)
            })
            .end((error, response) => {
                if (error) return done()
                Todo.findById(hexId).then(todo => {
                    expect(todo).toNotExist()
                    done()
                }).catch(error => done(error))
            })
    })

    it('should return 404 if todo not found', (done) => {
        const hexId = new ObjectID().toHexString()
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(404)
            .end(done)
    })

    it('should return 404 if object id is invalid', (done) => {
        request(app)
            .delete('/todos/1212')
            .expect(404)
            .end(done)
    })
})

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        const id = todos[0]._id.toHexString()
        request(app)
            .patch(`/todos/${id}`)
            .send({
                text: 'abc',
                completed: true
            })
            .expect(200)
            .expect(response => {
                expect(response.body.todo.text).toBe('abc')
                expect(response.body.todo.completed).toBe(true)
                expect(response.body.todo.completedAt).toBeA('number')
            })
            .end(done)
    })

    it('should clear completedAt when todo is not completed', (done) => {
        const id = todos[1]._id.toHexString()
        request(app)
            .patch(`/todos/${id}`)
            .send({
                text: 'xyz',
                completed: false
            })
            .expect(200)
            .expect(response => {
                expect(response.body.todo.text).toBe('xyz')
                expect(response.body.todo.completed).toBe(false)
                expect(response.body.todo.completedAt).toNotExist()
            })
            .end(done)
    })
})