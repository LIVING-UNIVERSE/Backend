import { useEffect, useState } from 'react'
import axios from 'axios';
import './App.css'

function App() {
  const [jokes,setJokes]= useState([])

  useEffect(()=>{
    axios.get('/api/jokes')
    .then((response)=>(
      setJokes(response.data)
    ))
    .catch((error)=>{
      console.log(error)
    })
    .finally(()=>{
      console.log("promise is completed.")
    })
})

  return (
    <>
      <h1>This is a Jokes Website.</h1>
      <h1>Currently having {jokes.length} jokes.</h1>
      {jokes.map((joke,index)=>(
        <div key={joke.id}>
          <h2>joke.joke_h</h2>
          <h3>joke.joke</h3>
        </div>
      ))}
    </>
  )
}

export default App
