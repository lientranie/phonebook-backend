const express = require('express')
const morgan =  require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())

// use Morgan middleware with "tiny" configuration for logging
//app.use(morgan('tiny'));

// custom token to log request body
morgan.token('body', (request) => JSON.stringify(request.body))
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Phonebook</h1>')
})

app.get('/api/persons', (request, response) => {
    console.log('Received POST request with body:', request.body); // Print the request body
    response.json(persons)
  })

app.get('/info', (request, response) => {
    const numPersons = persons.length
    const currentTime = new Date()

    response.send(`
        <p> Phonebook has info for ${numPersons} people</p>
        <p> ${currentTime} </p>
        `)
})

// get a specific person by id
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const person = persons.find(person => person.id === id);
    if (person) {
        response.json(person);
    } else {
        response.status(404).json({ error: 'Person not found' });
    }
  });

// delete a specific person by id
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const personIndex = persons.findIndex(p => p.id === id)

    if (personIndex !== -1){
        persons = persons.filter(person => person.id !==id)
        response.status(204).end() // Send 204 No Content as the response
    } else {
        response.status(404).json({error: 'Person not found'})
    }
})

const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(n => Number(n.id)))
      : 0
    return String(maxId + 1)
  }
app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or number is missing'
        })
    }
    
    const nameExists = persons.some(person => person.name === body.name)
    if (nameExists){
        return response.status(400).json({
            error: 'Name must be unique'
        })
    }

    const newPerson = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(newPerson)
    response.status(201).json(newPerson)
  });

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)