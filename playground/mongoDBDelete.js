const { MongoClient, ObjectID } = require('mongodb')
const url = 'mongodb://localhost:27017/TodoApp'

MongoClient.connect(url, {useNewUrlParser: true}, (error, client) => {
    if (error) return console.log('Connection error', error)
    console.log('connection success')
    const db = client.db('TodoApp')

    // db.collection('Todos').deleteMany({
    //     text: "Something to do",
    //     completed: true
    // }).then((result) => {
    //     console.log(result)
    // })
    
    // db.collection('Todos').deleteOne({
    //     text: "Something to do"
    // }).then((result) => {
    //     console.log(result)
    // })

    // db.collection('Todos').findOneAndDelete({
    //     text: "Walk the dog"
    // }).then((result) => {
    //     console.log(result)
    // })

    // db.collection('Users').deleteMany({
    //     name: 'Deepak'
    // }).then((result) => {
    //     console.log(result)
    // })

    db.collection('Users').findOneAndDelete({
        _id: new ObjectID('5c1e0281f73a212c30c9cbab')
    }).then((result) => {
        console.log(result)
    })

    client.close()
})