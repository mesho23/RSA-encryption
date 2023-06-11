var createError = require('http-errors');             // imports like in java " imprt java.utile.*"
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const app = express();
const http= require("http");
const crypto = require('crypto');
const forge = require('node-forge');

const port = 3030;


// start the server
const server = http.createServer(app).listen(port,()=>{

  console.log("listeing on port: "+port);
})

// intilze the socket io libary by passing it the server

const io = require("socket.io")(server,{
  cors: {
      origin: ["http://localhost:3030"]
  },
  maxHttpBufferSize: 1e6
});


// middleware: in plain in english and simple words they are funtion that all request pass through 

// view engine setup = use ejs extension rather than html 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

// parse the request to json format 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// must have for public facing file ex. javascripts, css 
app.use(express.static(path.join(__dirname, 'public')));



// operation for GET request

app.get("/",(req,res)=>{
  res.render("index.ejs")
})


// socket logic
onlineSockets = new Map();

onlineUsers = []
io.on('connection', (socket) => {
  io.emit("new_user",socket.id);
  socket.emit("joined_user",onlineUsers);
  onlineUsers.push(socket.id)
  const publicKeyPem = socket.handshake.query.publicKey;
  
  onlineSockets.set(socket.id,publicKeyPem);

  

  

 
    socket.on('send_rec', (receiver,encryptedData,i)=>{
     
      io.to(receiver).emit("receive",encryptedData,i)
    });
  socket.on("getPublicKey",async(receiver)=>{
    
    userToSendPubKey = await onlineSockets.get(receiver)

    socket.emit("enc",userToSendPubKey,receiver)
  })


  socket.on("disconnect",()=>{
    io.emit("user_left",socket.id)
    onlineUsers.forEach(element => {
      if (element==socket.id){
        const index = onlineUsers.indexOf(element);
if (index > -1) {
  onlineUsers.splice(index, 1);
}
      }
    });
  })
 
})


// determine file type






module.exports = app;
