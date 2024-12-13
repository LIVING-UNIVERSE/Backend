import express from 'express'
const app = express()
import 'dotenv/config'

const port = process.env.PORT || 3000

app.get('/',(req,res)=>{
    res.send("this is a server")
})

const jokes = [
    {
        id:1,
        'joke_h':'JOKE1',
        'joke':'This is joke 1.'
    },
    {
        id:2,
        'joke_h':'JOKE2',
        'joke':'This is joke 2.'
    },
    {
        id:3,
        'joke_h':'JOKE3',
        'joke':'This is joke 3.'
    },
    {
        id:4,
        'joke_h':'JOKE4',
        'joke':'This is joke 4.'
    },
    {
        id:5,
        'joke_h':'JOKE5',
        'joke':'This is joke 5.'
    }
]

app.get('/api/jokes',(req,res)=>{
    res.send(jokes)
})

app.listen(port,()=>{
    console.log(`listening to the port ${port}`)
})