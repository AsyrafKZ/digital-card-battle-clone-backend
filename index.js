const cors = require('cors')
const express = require('express')
const http = require('http')
const io = require('socket.io')(5005, {
    cors: {
        origin: ["http://localhost:3000"]
    }
})

// setup API server
const app = express()
app.use(cors())
const server = http.createServer(app)

// dummy db
const fs = require('fs')
const cards = JSON.parse(fs.readFileSync('./db/cards.json'))
const monsterCards = cards["monster_cards"]
const optionCards = cards["option_cards"]
const player1 = JSON.parse(fs.readFileSync('./db/userA.json'))
const player2 = JSON.parse(fs.readFileSync('./db/betamon.json'))

// match status
const player1cards = []
const player2cards = []

// base URL test
app.get('/', (req,res) => {
    res.send('Hello world. Bankai! Katenkyoushi')
})

// get all monster cards
app.get('/api/monsters', (req, res)=> {
    res.send(monsterCards)
})

// get monster card with id
app.get('/api/monsters/id=:id', (req, res)=> {
    let idArr = req.params.id
    idArr = idArr.split(",")
    let cardArr = []
    for (let i = 0; i < idArr.length; i++) {
        const id = idArr[i];
        cardArr.push(monsterCards[id])
    }
    res.send(cardArr)
})

// get all option cards
app.get('/api/options', (req, res)=> {
    res.send(optionCards)
})

// get option card with id
app.get('/api/options/id=:id', (req, res)=> {
    let idArr = req.params.id
    idArr = idArr.split(",")
    let cardArr = []
    const firstOptionCardId = 191
    for (let i = 0; i < idArr.length; i++) {
        let id = idArr[i];
        id = id - firstOptionCardId 
        cardArr.push(optionCards[id])
    }
    res.send(cardArr)
})

// get dummy user
app.get('/api/users/:id', (req, res)=> {
    let id = req.params.id
    let userInfo = {}
    // this here should be SQL query
    // SELECT * FROM user WHERE user_id = ?; gitu
    if (id == player1.user_id) {
        userInfo = player1
    } else {
        userInfo = player2
    }
    res.send(userInfo)
})

// Socket IO
// Run when a client connects
io.on('connection', socket => {
    console.log(`new user: ${socket.id} connected\n#####`)

    // Message to current user
    socket.emit('welcome-message', 'You are now connected to the socket.io server')

    // Events from client
    socket.on('tell-id', (id)=>{
        socket.broadcast.emit('user-id', id)
    })

    socket.on('draw-card', (count) => {
        socket.broadcast.emit('opponent-draw-card', count)
    })

    // Runs when a client disconnects
    socket.on('disconnect', () => {
        console.log(`user: ${socket.id} disconnected`)
        socket.broadcast.emit('opponent-disconnect', socket.id)
    })
})

// Run API (bukan socket.io)
const port = process.env.PORT || 3005
server.listen(port, () => console.log(`Listening on port ${port}....`))