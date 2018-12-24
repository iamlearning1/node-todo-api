const { mongoose } = require('./../server/db/mongoose')
const { Todo } = require('./../server/models/todo')
const { ObjectID } = require('mongodb')

// const id = '5c20c19f23d74d940be2e0f5'
// if (!ObjectID.isValid(id)) {
//     console.log('ID not valid')
// }
// Todo.find({
//     text: 'Lunch'
// }).then(docs => {
//     console.log('docs', docs)
// })

// Todo.findOne({
//     _id: id
// }).then(doc => {
//     console.log('doc', doc)
// })

// Todo.findById(id).then(todo => {
//     if (!todo) return console.log('Id does not exists')
//     console.log('Todo by id', todo)
// })