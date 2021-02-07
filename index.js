const http = require('http')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('content', function getContent (request){
  return JSON.stringify(request.body)
})

const app = express()
app.use(express.json())
app.use(morgan(':method :url :response-time :content'))
app.use(cors())

let persons =  [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
  ]

  app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if(person){
      response.json(person)
    } else {
      response.status(404).end
    }
  })

  app.get('/info', (request, response) => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>`
      )
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
  })

  const generateId = () => {
    Math.floor(Math.random() * 1000000)
  }

  app.post('/api/persons', (request, response) => {
    const body = request.body
    if(!body.name){
      return response.status(400).json({
        error: 'name required'
      })
    }

    if(!body.number){
      return response.status(400).json({
        error: 'number required'
      })
    }
    
    const names = persons.map(person => person.name)
  
    if(names.includes(body.name)){
      return response.status(400).json({
        error: 'name must be unique'
      })
    }
    
    const person = {
      name: body.name,
      number: body.number,
      id: generateId()
    }

    persons.concat(person)

    response.json(person)
  })
 
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
