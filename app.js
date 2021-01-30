const fs=require("fs");
const axios=require("axios");
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
//const socket=require("socket.io");
const msgformat=require('./utils/msgformat');
const {joinuser, getuser, leaveuser, roomusers, getid}=require('./utils/users');
const roomschema=require("./models/room");
const roomchat=require("./models/roomchat");
const clientchat=require("./models/chat");
const download=require("image-downloader");
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
app.use(bodyparser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyparser.json())
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


const PORT = process.env.PORT;

var server=http.createServer(app);
server.listen(PORT, console.log(`Server started on port ${PORT}`));
var socket= require('socket.io');

var io=socket.listen(server);

//Run when user connects...
io.on('connection',(clientsocket)=>{
    console.log("successfully WS connected..");

clientsocket.on("image",(image)=>{
    console.log(image);
    const user=getuser(clientsocket.id);
    io.to(user.room).emit('room_images',{room: user.room,users:roomusers(user.room),image:image});
    //clientsocket.broadcast.to(user.room).emit("room_images",{image});
       
})
clientsocket.on("image_download",(image)=>{
    console.log("download:",image);
    // async function download(){
    //     const p=path.resolve(__dirname,'files',image.name);
    //     const response=await axios({
    //         host:'localhost',
    //         port:3000,
    //         method:'GET',
    //         url:image.img,
    //         responseType:'stream'
    //     })
    //     response.data.pipe(fs.createWriteStream(p));
    //     return new Promise((resolve,reject)=>{
    //         response.data.on('end',()=>{
    //             resolve()
    //         })
    //         response.data.on('error',err=>{
    //             reject(err)
    //         })
    //     }).then(()=>console.log("ss")).catch((err)=>console.log(err));
    // }
    // download().then(()=>{
    //     console.log('downloaded');
    // })

    // const options={
    //     url:'http://localhost:3000/'+image.img,
    //     dest:'/files'
    // }
    // download.image(options).then(({filename})=>{
    //     console.log(filename);
    // })
    // .catch(err=>console.log(err));
})  

clientsocket.on("joinroom",({username,room})=>{
        client=username;
        //console.log(username,room);
        const user=joinuser(clientsocket.id,username,room);
        console.log(user);
        clientsocket.join(user.room);

        roomchat.find({roomName:room},(err,user)=>{
            console.log("previous room chat..")
            if(err)console.log(err);
            else{
                //console.log(user.length,user[0].roomchat);
                if(user.length>0){
                    clientsocket.emit("room",{chat:user[0].roomchat,username});
                    //console.log(user[0].roomchat); 
                }
        }
    })


         //welcome to current user only
        clientsocket.emit("message",msgformat(clientsocket.id,"ChatBot","welcome to chatRoom"));

        //Broadcast everyone when a user connects..excepts that new connected user
        clientsocket.broadcast.to(user.room).emit("message",msgformat(clientsocket.id,"ChatBot",`${user.username} as joined the chat..`));
        
        //server sending the roomname and roomUsers to the each and evevry client..(of particular room)
        io.to(user.room).emit('roomusers',{room: user.room,users:roomusers(user.room)});

     


    })
    
   
    
    //receiving msg from client..
    clientsocket.on('chatmessage',(msg)=>{
        //console.log(clientsocket.id);
        const user=getuser(clientsocket.id);
        const msgform=msgformat(clientsocket.id,user.username,msg);
        //putting into database...
        const chat={
            roomName:user.room,
            roomchat:{
                sender:user.username,
                msg:msg,
                time:msgform.time,
            }
        };
        roomchat.find({roomName:user.room},(err,room)=>{
            if(room.length==0){
                roomchat(chat).save()
                .then(()=>console.log("added into roomchatDB"))
                .catch(err=>console.log(err));
            }
            else{
                chat1={  
                    sender:user.username,
                    msg:msg,
                    time:msgform.time,
                }
                console.log(chat);
                //roomchat.update({roomName:user.room},{$push:{roomchat:{sender:user.username,msg:msg,time:msgform.time}}});
                roomchat.updateOne({"roomName":user.room},{"$addToSet":{"roomchat":chat1}},{safe:true},(err,result)=>{
                    if(err)console.log(err);
                    else
                    console.log(result);
                })
                console.log("pushed");
            }
        });
       
    
        io.to(user.room).emit("message",msgform);
    })
    clientsocket.on('personalmsg',(msg)=>{
        const user=getid(msg.to);
        const user1=getuser(clientsocket.id);
        io.to(user.id).emit("personalmsg",msgformat(clientsocket.id,user1.username,msg.message));
    })

    clientsocket.on('panelmsg',(msg)=>{

        const to=getid(msg.to);
        const from=getuser(msg.from);
        const tomsgtime=msgformat(from.id,from.username,msg.message);
        const frommsgtime=msgformat(clientsocket.id,to.username,msg.message);
        
        //receiver...to
       clientchat.find({username:to.username},(err,user)=>{
           if(user.length>0){
               clientchat.find({username:to.username,"chat.username":from.username},(err,user)=>{
                   if(user.length>0){
                       data={
                           sender:from.username,
                           msg:msg.message,
                           time:tomsgtime.time,
                       }
                       clientchat.updateOne({username:to.username,"chat.username":from.username},{"$addToSet":{"chat.$.chat":data}},{safe:true},(err,result)=>{
                           if(err)console.log(err);
                           else
                           console.log(result);
                       })
                       console.log(user,"there");
                   }
                   else{
                       data={
                           username:from.username,
                           chat:{
                               sender:from.username,
                               msg:msg.message,
                               time:tomsgtime.time,
                           }
                       }
                       clientchat.updateOne({"username":to.username},{"$addToSet":{"chat":data}},{safe:true},(err,result)=>{
                           if(err)console.log(err);
                           else
                           console.log(result,"record pushed into receivers chat Collection..");
                       })
                   }
               })
           }
           else{
               data={
                   username:to.username,
                   chat:{
                       username:from.username,
                       chat:{
                       sender:from.username,
                       msg:msg.message,
                       time:tomsgtime.time,
                   }
                }
               }
               clientchat(data).save();
               console.log("receiver record created...");
           }
       })
       //senders...from
       clientchat.find({username:from.username},(err,user)=>{
        if(user.length>0){
            clientchat.find({username:from.username,"chat.username":to.username},(err,user)=>{
                if(user.length>0){
                    data={
                        sender:"You ",
                        msg:msg.message,
                        time:tomsgtime.time,
                    }
                    clientchat.updateOne({username:from.username,"chat.username":to.username},{"$addToSet":{"chat.$.chat":data}},{safe:true},(err,result)=>{
                        if(err)console.log(err);
                        else
                        console.log(result);
                    })
                    console.log(user,"there");
                }
                else{
                    data={
                        username:to.username,
                        chat:{
                            sender:"You ",
                            msg:msg.message,
                            time:tomsgtime.time,
                        }
                    }
                    clientchat.updateOne({"username":from.username},{"$addToSet":{"chat":data}},{safe:true},(err,result)=>{
                        if(err)console.log(err);
                        else
                        console.log(result,"record pushed into receivers chat Collection..");
                    })
                }
            })
        }
        else{
            data={
                username:from.username,
                chat:{
                    username:to.username,
                    chat:{
                    sender:"You ",
                    msg:msg.message,
                    time:tomsgtime.time,
                }
             }
            }
            clientchat(data).save();
            console.log("receiver record created...");
        }
    })
    
        // //receivers...
        // clientchat.find({username:to.username},(err,user)=>{
            
        //     if(user.length>0){
        //         chat1={
        //             sender:from.username,
        //             msg:msg.message,
        //             time:tomsgtime.time,
        //         }
        //         console.log(user.length);
        //         clientchat.updateOne({"username":to.username},{"$addToSet":{"chat":chat1}},{safe:true},(err,result)=>{
        //             if(err)console.log(err);
        //             else
        //             console.log("result");
        //         })
        //         console.log("pushed");
        //     }
        //     else{
        //          data={
        //             username:to.username,
        //             chat:{
        //                 sender:from.username,
        //                 msg:msg.message,
        //                 time:tomsgtime.time,
        //             }
        //         }
        //         clientchat(data).save();
        //         console.log("created..");
        //     }
        // })

        //  //senders...
        //  clientchat.find({username:from.username},(err,user)=>{
            
        //     if(user.length>0){
        //          chat1={
        //             sender:"You",
        //             msg:msg.message,
        //             time:frommsgtime.time,
        //         }
        //         console.log(user.length);
        //         clientchat.updateOne({"username":from.username},{"$addToSet":{"chat":chat1}},{safe:true},(err,result)=>{
        //             if(err)console.log(err);
        //             else
        //             console.log(result);
        //         })
        //         console.log("pushed");
        //     }
        //     else{
        //          data={
        //             username:from.username,
        //             chat:{
        //                 sender:"You",
        //                 msg:msg.message,
        //                 time:frommsgtime.time,
        //             }
        //         }
        //         clientchat(data).save();
        //         console.log("created..");
        //     }
        // })
       
    



        //console.log(from);
        //io.to(to.id).emit("panelpersonalmsgin",tomsgtime);
        //clientsocket.emit('panelpersonalmsgout',frommsgtime);
    })
    clientsocket.on("personalchat",(msg)=>{
        var fromuser=getuser(msg.from);
        var to=getid(msg.to);
        clientchat.find({"username":fromuser.username},"chat",(err,user)=>{
            console.log(user);
            if(err)console.log(err);
            else{
                console.log(user.length);
                if(user.length>0){
                    var users;
                    user[0].chat.forEach(mssg=>{if(mssg.username==msg.to)
                    users=mssg.chat;
                    } );
                   console.log(users);
                    //console.log("chat data",user[0].chat[0].chat);
                    io.to(to.id).emit("personalchat",users);
                    clientsocket.emit("personalchat",users);
                }
                else{
                    console.log("empty1");
                    io.to(to.id).emit("personalmsg",[]);
                    clientsocket.emit("personalmsg",[]);
                }
            }
        })
    })

    clientsocket.on("previouspersonalchat",(msg)=>{
       // console.log("msg",msg)
            var fromuser=getuser(msg.from);
           // console.log("formuser",fromuser);
            // clientchat.find({username:fromuser.username},(err,user)=>{
            //     if(user.length>0){
                    clientchat.find({"username":fromuser.username},"chat",(err,user)=>{
                        console.log(user);
                        if(err)console.log(err);
                        else{
                            console.log(user.length);
                            if(user.length>0){
                                var users;
                                user[0].chat.forEach(mssg=>{if(mssg.username==msg.to)
                                users=mssg.chat;
                                } );
                               console.log(users);
                                //console.log("chat data",user[0].chat[0].chat);
                               clientsocket.emit("previouspersonalchat",users);
                            }
                            else{
                                console.log("empty1");
                                clientsocket.emit("previouspersonalchat",[]);
                            }
                        }
                    })
                
            //     }
            //     else{
            //         clientsocket.emit("previouspersonalchat",[]);
            //     }
            // })
    })

    //when user disconnects..
    clientsocket.on('disconnect',()=>{
        const user=leaveuser(clientsocket.id);

        if(user){
            io.to(user.room).emit("message",msgformat(clientsocket.id,"ChatBot",`${user.username} as left the chat..`));
        };
        
        //after removing the current client and roomusers remaining list is....
        io.to(user.room).emit('roomusers',{room: user.room,  users:roomusers(user.room)});
    })

})
