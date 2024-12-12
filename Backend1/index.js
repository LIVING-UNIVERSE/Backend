require('dotenv').config()
const express = require('express')
const app = express()

app.get('/',(req,res)=>{
    res.send('hello world')
})

app.get('/home',(req,res)=>{
    res.send('<h1>This is another Home</h1>')
})

app.listen(process.env.PORT,()=>{
    console.log(`this port is port ${process.env.PORT}`)
}) 