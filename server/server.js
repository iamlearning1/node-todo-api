const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/TodoApp')

const Todo = mongoose.model('Todo', {
    text: {
        type: String
    },
    completed: {
        type: Boolean
    },
    completedAt: {
        type: Number
    }
})

// const newTodo = new Todo({
//     text: 'NodeJS',
//     completed: false
// })

const newTodo = new Todo({
    text: 'React',
    completed: true,
    completedAt: new Date().getMilliseconds()
})

newTodo.save().then((doc) => {
    console.log(doc)
}).catch(error => {
    console.log(error)
})