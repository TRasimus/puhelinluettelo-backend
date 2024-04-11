require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')
const morgan = require('morgan')
const cors = require('cors')

//create custom morgan token for logging request body
morgan.token('body', req => {
  const requestBody = JSON.stringify(req.body)
  return requestBody
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('dist'))

    
  app.get('/info', async (request, response) => {
    const count = await Person.countDocuments({})
    response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>`
          )
  })

  app.get('/api/persons', (request, response) => {
   Person.find({}).then(persons => {
      response.json(persons)
   })
  })

  app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id)
      .then(person => {
        if (person) {
          response.json(person)
        } else {
          response.status(404).end
        } 
      })
      .catch(error => next(error))
  })

  app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })
  
  app.post('/api/persons', (request, response, next) => {
    const body = request.body
  
    const person = new Person({
      name: body.name,
      number: body.number,
    }) 
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
  })

  app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true, context:'query'})
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  
    next(error)
  }

  app.use(errorHandler)
  
  const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })