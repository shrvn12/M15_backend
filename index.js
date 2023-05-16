const express = require('express');
const http = require('http');
const socket = require('socket.io');
const cors = require('cors');
const { connection } = require('./configs/db');
const { userRouter } = require('./routes/user.routes');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json());

app.get('/',(req, res) => {
    res.status(200).send({msg:'Basic API endpoint'});
})

app.use('/',userRouter);

const server = http.createServer(app);

server.listen(process.env.port,async () => {
    console.log('Waiting for DB connection ⌛')
    try {
        await connection;
        console.log('Connected to DB 🌿');
    } catch (error) {
        console.log('Error while connecting with DB ⚠️');
        console.log(error);
    }
    console.log(`Server running at port ${process.env.port} 🏃🏻‍♂️`);
});

const io = socket(server);

io.on('connection',(socket) => {
    console.log('one user online');

    socket.on('joinroom',({room}) => {
        socket.join(room);
        if(room == 'room1' || room == 'room2'){
            socket.emit('message',`You are online at ${room} \n Send some message to recieve it on other side`);
        }
        else{
            socket.emit('message',`You are online, send some message`);
        }
    })

    socket.on('message',({msg, room})=>{
        console.log(room);
        socket.to(room).emit('message', msg);
    })
})