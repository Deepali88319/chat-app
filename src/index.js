const path = require('path')
const http = require('http')
const express = require("express")
const socketio = require("socket.io")
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const { get } = require('https')

const app = express();
const server = http.createServer(app)  //created the server outside the express library
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname,'../public') 
// __dirname represents script's current directory and ../public mnz it goes up one level and enters into public directory
//So, publicDirectoryPath will contain the absolute path to the public directory 
app.use(express.static(publicDirectoryPath))

// let count = 0;

// server(emit) -> client (recieve) - countUpdated
// client(emit) -> server (recieve) - increment

io.on('connection',(socket)=>{   //when new client connects
    console.log("New Websocket Connection...!")

    // socket.emit('countUpdated', count)

    // socket.on('increment', () =>{
    //     count++
    //     io.emit('countUpdated',count)
    // })
    // socket.on('join', ({ username, room }) => {
    //     socket.join(room)

    //     socket.emit('message', generateMessage('Welcome!'))
    //     socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))

        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit
        //io.to.emit will send an event to everyone in room but not to every room
        //socket.broadcast.to.emit will send an event to everyone except for this specific client
    // })

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    // Note: server can emit the events in three ways 
    // 1. socket.emit will emit the events to single client 
    // 2. whereas io.emit will emit the events to all the clients running on same port
    // socket.emit('message', 'Welcome!')  
    // socket.emit('message', generateMessage('Welcome!'))
    // 3.if we want to emit an event to everybody except for the one we're referring from then broadcast is used
    //    socket.broadcast.emit('message','A new user has joined!')
   //      socket.broadcast.emit('message', generateMessage('A new user has joined!'))
    

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        const user = getUser(socket.id);

        // io.to('Center City').emit('message', generateMessage(message))
        io.to(user.room).emit('message', generateMessage(user.username,message))
        // io.emit('message', generateMessage(message))
        // io.emit('message', message)
        callback()
    })


   socket.on('sendLocation', (coords, callback) => {
    //   io.emit('message',`Location: ${coords.latitude}, ${coords.longitude}`)
    // io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    // io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback();
})  

//    socket.on('sendLocation', (coords, callback) => {
//     //   io.emit('message',`Location: ${coords.latitude}, ${coords.longitude}`)
//     io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
//     callback();
// }) 

socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
        io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    }
})

//    socket.on('disconnect',()=>{
//     //    io.emit('message','A user has left!')
//        io.emit('message', generateMessage('A user has left!'))
//    })

})

// app.listen(port,()=>{
//     console.log("Server is running on",port)
// });
server.listen(port,()=>{
    console.log("Server is running on",port)
});
