const { MongoClient, ObjectID } = require('mongodb')
const url = 'mongodb://localhost:27017/TodoApp'

MongoClient.connect(url, {useNewUrlParser: true}, (error, client) => {
    if (error) return console.log('Connection error', error)
    console.log('connection success')
    const db = client.db('TodoApp')

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5c1e03cecda2401e803a0cae')
    // }, {
    //     $set: {
    //         text: 'NodeJS'
    //     }
    // }, {
    //     returnOriginal: false
    // }).then((result) => {
    //     console.log(result)
    // })

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5c1d408e45dc7120b8861b1a')
    }, {
        $inc: {
            age: -100
        }
    }, {
        returnOriginal: false
    }).then((result) => {
        console.log(result)
    })

    client.close()
})