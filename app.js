
const express = require('express');
const http=require("http");
const path=require("path");
const expressLayouts = require('express-ejs-layouts');
var bodyparser=require('body-parser');
var cookieparser=require("cookie-parser");
const mongoose = require('mongoose');
const cors=require("cors");
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const socket=require("socket.io");
const msgformat=require('./utils/msgformat');
const {joinuser, getuser, leaveuser, roomusers}=require('./utils/users');


require("dotenv").config();

const app = express();
app.use(express.static(path.join(__dirname,'public')));




app.use(cors());

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = process.env.MONGODB_URL;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
//app.use(expressLayouts);
app.set(express.urlencoded({extended:true}));
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');



// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
 next();
});


// Routes
app.use('/', require('./routes/users'));

const server=http.createServer(app);

//socket connection...
const io=socket(server);



//Run when user connects...
io.on('connection',(clientsocket)=>{
    console.log("successfully WS connected..");
  
    clientsocket.on("joinroom",({username,room})=>{
        
        const user=joinuser(clientsocket.id,username,room);
  
        clientsocket.join(user.room);
  
         //welcome to current user only
        clientsocket.emit("message",msgformat("ChatBot","welcome to chatRoom"));
  
        //Broadcast everyone when a user connects..excepts that new connected user
        clientsocket.broadcast.to(user.room).emit("message",msgformat("ChatBot",`${user.username} as joined the chat..`));
        
        //server sending the roomname and roomUsers to the each and evevry client..(of particular room)
        io.to(user.room).emit('roomusers',{room: user.room,users:roomusers(user.room)});
  
    })
    
   
    
    //receiving msg from client..
    clientsocket.on('chatmessage',(msg)=>{
        const user=getuser(clientsocket.id);
        io.to(user.room).emit("message",msgformat(user.username,msg));
    })
  
    //when user disconnects..
    clientsocket.on('disconnect',()=>{
        const user=leaveuser(clientsocket.id);
  
        if(user){
            io.to(user.room).emit("message",msgformat("ChatBot",`${user.username} as left the chat..`));
        };
        
        //after removing the current client and roomusers remaining list is....
        io.to(user.room).emit('roomusers',{room: user.room,  users:roomusers(user.room)});
    })
  
  })











const PORT = process.env.PORT;

app.listen(PORT, console.log(`Server started on port ${PORT}`));


