// const MongoClient = require('mongodb').MongoClient
const { MongoClient } = require('mongodb')
const url = 'mongodb://localhost:27017/TodoApp'

MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
    if (error) return console.log('Connection failed')
    console.log('Connection success')

    const db = client.db('TodoApp')
    db.collection('Todos').insertOne({
        text: 'Something to do',
        completed: false
    }, (error, result) => {
        if (error) return console.log('Unable to insert data', error)
        console.log(JSON.stringify(result.ops, undefined, 2))
    })

    db.collection('Users').insertOne({
        name: 'Deepak',
        age: 24,
        location: 'Noida'
    }, (error, result) => {
        if (error) return console.log('Unable to insert data in to Users collection', error)
        console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2))
    })

    client.close()
})