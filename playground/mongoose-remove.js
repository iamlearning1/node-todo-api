const { mongoose } = require('../server/db/mongoose')
const { Todo } = require('../server/models/todo')
const { ObjectID } = require('mongodb')

// Todo.remove({}).then(results => {
//     console.log(results)
// })

// Todo.findOneAndRemove()
Todo.findByIdAndRemove('5c20cf8c5687d62aece5046c').then(todo => {
    console.log(todo)
})