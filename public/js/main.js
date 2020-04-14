const sock=io();
console.log("dd");
var chat=document.querySelector('.chat-messages');
var form=document.getElementById('chat-form');
var roomname=document.getElementById('room-name');
var roomusers=document.getElementById('users');

form.addEventListener('submit',(event)=>{
    event.preventDefault();

    var txt=event.target.elements.msg.value;
    sock.emit('chatmessage',txt);//sending to server...from one particular client..
    event.target.elements.msg.value='';
    event.target.elements.msg.focus();
}) 

//get the current client username and room...
const {username, room}=Qs.parse(location.search,{
    ignoreQueryPrefix: true
});
//sending username and room to the server to establish the socket connection to particular room..
sock.emit("joinroom",{username,room});

//receiving the roomname and roomusers..
sock.on('roomusers',({room, users})=>{
    roomname.innerHTML=room;
    
    roomusers.innerHTML='';
    users.forEach(user=>{
        roomusers.innerHTML+=`<li>${user.username}</li>`;
    })
});

//receiving from server...
sock.on('message',(msg)=>{
    console.log(msg);
    output(msg);
    
    chat.scrollTop=chat.scrollHeight;
})

function output(msg){
    var div=document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<br><p class='meta'>${msg.uName}&nbsp<span>${msg.time}<span></p><p class='test'>${msg.txt}</p>`;
    document.querySelector('.chat-messages').append(div);
}

var source=new EventSource("../views/signup.html");
source.onmessage=function(event){
    console.log(event.data);
    document.getElementById("result").innerHTML+=event.data+"<br>";
}