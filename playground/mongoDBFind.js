const { MongoClient, ObjectID } = require('mongodb')
const url = 'mongodb://localhost:27017/TodoApp'

MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
    if (error) return console.log('Database not connected', error)
    console.log('Succesfully connected')
    const db = client.db('TodoApp')

    // db.collection('Todos').find({ 
    //     _id: new ObjectID('5c1d3cfdf853410c2c11f168') 
    // }).toArray().then((docs) => {
    //     console.log(docs)
    // }).catch((error) => {
    //     console.log(error)
    // })

    // db.collection('Todos').find().count().then((count) => {
    //     console.log(count)
    // }).catch((error) => {
    //     console.log(error)
    // })

    db.collection('Users').find({ name: "Deepak" }).toArray().then((docs) => {
        console.log(docs)
    }).catch((error) => {
        console.log(error)
    })

    client.close()
})