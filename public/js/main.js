const sock=io();

var chat=document.querySelector('.chat-messages');
var form=document.getElementById('chat-form');
var roomname=document.getElementById('room-name');
var roomusers=document.getElementById('users');

//var personalchatin=[];
//var personalchatout=[];
var chat=[];
var personalchat;

document.getElementById('img').addEventListener('change',(e)=>{
    var file=e.target.files[0];
    console.log(file.name);
    var reader=new FileReader();
    reader.onload=function(evt){
        sock.emit('image',{img:evt.target.result,name:file.name});
    };
    reader.readAsDataURL(file);

})
form.addEventListener('submit',(event)=>{
    event.preventDefault();
    var txt1=event.target.elements.to.value;
    var txt=event.target.elements.msg.value;
    if(txt1==''){
        
    sock.emit('chatmessage',txt);//sending to server...from one particular client..
    event.target.elements.msg.value='';
    event.target.elements.msg.focus();
    }
    else{
        const msg={
            to:txt1,
            message:txt
        }
        sock.emit('personalmsg',msg);
        event.target.elements.to.value='';
    }
}) 

//get the current client username and room...
const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix: true
});
//sending username and room to the server to establish the socket connection to particular room..
sock.emit("joinroom",{username,room});

//receiving the roomname and roomusers..
sock.on('roomusers',({room, users})=>{
    roomname.innerHTML=room;
    
    roomusers.innerHTML='';


    users.forEach(user=>{
        if(sock.id!=user.id){
        // roomusers.innerHTML+=`<li><a href='/personal/(?id1=${sock.id}&id2=${user.id}'>${user.username})</a></li>`;
        var anc=document.createElement('a');
        anc.innerHTML=user.username;
        anc.setAttribute("href","#");
        anc.setAttribute("class","u");
        anc.style.background=" #e6e9ff";
        anc.addEventListener("click",(event)=>{
            var users=event.target.innerHTML;
            sock.emit("previouspersonalchat",{to:users,from:sock.id});
            //var chat=[];

            sock.on("previouspersonalchat",(msg)=>{
                //console.log(msg);
                personalchat=msg
                if(personalchat.length>0){
                    personalchat.forEach(user=>{
     //                   console.log(user);
                        if(user.sender!="You "){
                            var div=pop.document.createElement("div");
                            var para=pop.document.createElement("p");
                            para.innerHTML=`${user.sender}&nbsp${user.time}<br>${user.msg}<br>`;
                            div.style.backgroundColor="#667aff"
                            div.style.color=" #e6e9ff"
                            div.style.borderRadius="10px"
                            div.style.textAlign="left";
                            div.append(para);
                            main.append(div);
                            //pop.document.body.appendChild(main);
            
                        }else{
                            var div=pop.document.createElement("div");
                            var para=pop.document.createElement("p");
                            para.innerHTML=`You ${user.time}&nbsp<br>${user.msg}<br>`;
                            div.style.border="2px sollid white";
                            div.style.backgroundColor="black";
                            div.style.color="white";
                            div.style.borderRadius="10px"
                            div.style.textAlign="right";
                            div.append(para);
                            main.append(div);
                            //pop.document.body.appendChild(main);
                        }
                    })
                } 
                

            })

            
            var pop=open("","Popup","width=400,height=500");
            //header..div
            var head=pop.document.createElement("div");
            var p=pop.document.createElement("p");
            p.innerHTML=users;
            head.style.backgroundColor="black";
            head.style.color="white";
            head.style.textAlign="center";
            head.append(p)
            pop.document.body.appendChild(head);
            
            var main=pop.document.createElement("div");
            //main.setAttribute("class","chat-messages");
            main.style.height="400";
           
            main.style.overflowY="auto";
            pop.document.body.appendChild(main);
            main.scrollTop=main.scrollHeight;

            
           var foot=pop.document.createElement("div");
           foot.style.background="#5cb85c";
           foot.style.height="50px";
            pop.document.body.appendChild(foot);

            var text=pop.document.createElement("input");
                text.setAttribute("type","text");
                text.setAttribute("class","txt");
                text.style.width="300";
                text.style.marginTop="15px";
                text.style.marginLeft="10px";
                foot.append(text);
            var but=pop.document.createElement("button");
                but.innerHTML="send";
                but.style.marginTop="15px";
                //but.setAttribute("class","btn1");
                foot.append(but);

                //console.log(personalchat);
                
                var para=pop.document.createElement("p");
                //console.log("outgoing:-",personalchatout);
            //     if(personalchatout.length>0){
            //             personalchatout.forEach(user=>{
            //                 if(users==user.uName){
            //                     //para.innerHTML+=`<h4>You</h4>${user.time}<br>${user.txt}<br><br>`;
            //                     user.me="You";
            //                     chat.push(user);
            //                     // var ind=personalchatout.indexOf(user);
            //                     // personalchatout.splice(ind,1);
            //                 }
            //             })
            //     }//console.log("incoming:-",personalchatin);
            //     if(personalchatin.length>0){
            //         personalchatin.forEach(user=>{
            //             if(users==user.uName){
            //                 //para.innerHTML+=`<h4>${users}<h4>${user.time}<br>${user.txt}<br><br>`;
            //                 user.me="not me";
            //                 chat.push(user);
            //                 // var ind=personalchatin.indexOf(user);
            //                 // personalchatin.splice(ind,1);
            //             }
            //         })
            //     }
            //    //pop.document.body.appendChild(div.appendChild(para));
            //    console.log(chat);
            //    chat.sort((a,b)=>{
            //     timeStr1 = a.time ;
            //     timeStr2 = b.time;
            //     //console.log(a.time,b.time,timeStr1,timeStr2);
            //     return (parseInt(timeStr2.replace(':', ''), 10) > parseInt(timeStr1.replace(':', ''), 10)) ? -1 : 1;  
            //    });
            //    console.log("sorted chat:-",chat);
             //  var flag=0;
               //if(chat.length>0){
                //    main.innerHTML='';
                // chat.forEach(user=>{
                //     //                   console.log(user);
                //                        if(user.sender!="You "){
                //                            var div=pop.document.createElement("div");
                //                            var para=pop.document.createElement("p");
                //                            para.innerHTML=`${user.sender}&nbsp${user.time}<br>${user.msg}<br>`;
                //                            div.style.backgroundColor="#667aff"
                //                            div.style.color=" #e6e9ff"
                //                            div.style.borderRadius="10px"
                //                            div.style.textAlign="left";
                //                            div.append(para);
                //                            main.append(div);
                //                            //pop.document.body.appendChild(main);
                           
                //                        }else{
                //                            var div=pop.document.createElement("div");
                //                            var para=pop.document.createElement("p");
                //                            para.innerHTML=`You ${user.time}&nbsp<br>${user.msg}<br>`;
                //                            div.style.border="2px sollid white";
                //                            div.style.backgroundColor="black";
                //                            div.style.color="white";
                //                            div.style.borderRadius="10px"
                //                            div.style.textAlign="right";
                //                            div.append(para);
                //                            main.append(div);
                //                            //pop.document.body.appendChild(main);
                //                        }
                // //                    })
                // }
                // else{
                //     flag=1;
                //     // var text=pop.document.createElement("input");
                //     // text.setAttribute("type","text");
                //     // text.setAttribute("class","txt");
                //     // foot.append(text);
                //    // pop.document.body.appendChild(foot);
        
                //     // var but=pop.document.createElement("button");
                //     // but.innerHTML="send";
                //     but.addEventListener('click',(event)=>{
                //         var txt=pop.document.querySelector(".txt").value;
                //         const msg={
                //             to:users,
                //             from:sock.id,
                //             message:txt
                //         }
                        
                //         var div=pop.document.createElement("div");
                //         var para=pop.document.createElement("p");
                //         const d=new Date();
                //         para.innerHTML=`<h4>You&nbsp${d.getHours()+":"+d.getMinutes()}<h4><br\>${msg.message}<br>`;
                //         div.style.border="2px sollid white";
                //         div.style.backgroundColor="black";
                //         div.style.color="white";
                //         div.style.borderRadius="10px"
                //         div.style.textAlign="right";
                //         div.append(para);
                //         main.append(div);
                //      //   pop.document.body.appendChild(main);
                //         chat.pop();
                //         sock.emit("panelmsg",msg);
                       
                //     })
                //     foot.append(but);
                //     //pop.document.body.appendChild(foot);
                // }
                // if(flag==0){
                // var text=pop.document.createElement("input");
                // text.setAttribute("type","text");
                // text.setAttribute("class","txt");
                // foot.append(text);
              //  pop.document.body.appendChild(foot);
    
               
    
                // var but=pop.document.createElement("button");
                // but.innerHTML="send";
                but.addEventListener('click',(event)=>{
                    var txt=pop.document.querySelector(".txt").value;
                    const msg={
                        to:users,
                        from:sock.id,
                        message:txt
                    }
   //                 console.log(msg);
                    
                //    pop.document.body.appendChild(main);
                
                    sock.emit("panelmsg",msg);
                    
                    
                    var div=pop.document.createElement("div");
                    var para=pop.document.createElement("p");
                    const d=new Date();
                    para.innerHTML=`<h4>You&nbsp${d.getHours()+":"+d.getMinutes()}<h4>${msg.message}<br>`;
                    div.style.border="2px sollid white";
                    div.style.backgroundColor="black";
                    div.style.color="white";
                    div.style.textAlign="right";
                    div.append(para);
                    main.append(div);
                   
                })
                sock.emit("personalchat",{to:users,from:sock.id});
                sock.on('personalchat',(msg)=>{
                    if(msg.length>0){
                        main.innerHTML='';
                        console.log(msg);
                    msg.forEach(user=>{
                        //                   console.log(user);
                                           if(user.sender!="You "){
                                               var div=pop.document.createElement("div");
                                               var para=pop.document.createElement("p");
                                               para.innerHTML=`${user.sender}&nbsp${user.time}<br>${user.msg}<br>`;
                                               div.style.backgroundColor="#667aff"
                                               div.style.color=" #e6e9ff"
                                               div.style.borderRadius="10px"
                                               div.style.textAlign="left";
                                               div.append(para);
                                               main.append(div);
                                               //pop.document.body.appendChild(main);
                               
                                           }else{
                                               var div=pop.document.createElement("div");
                                               var para=pop.document.createElement("p");
                                               para.innerHTML=`You ${user.time}&nbsp<br>${user.msg}<br>`;
                                               div.style.border="2px sollid white";
                                               div.style.backgroundColor="black";
                                               div.style.color="white";
                                               div.style.borderRadius="10px"
                                               div.style.textAlign="right";
                                               div.append(para);
                                               main.append(div);
                                               //pop.document.body.appendChild(main);
                                           }
                                       })
                }})
                
                //chat.pop();
                // foot.append(but);
                //pop.document.body.appendChild(foot);
            });
            
            //});
        var li=document.createElement("li");
        li.appendChild(anc);
        roomusers.appendChild(li);
     } })
});



// sock.on('panelpersonalmsgout',(msg)=>{
//     //personalchatout.push(msg);
//     //console.log(msg);
//     msg.dir="me";
//     chat.push(msg);
// })

//roommessages printing from database...
sock.on('room',(msg)=>{
    
    //console.log(msg.chat,msg.clientname);
    msg.chat.forEach(chat=>{
    var div=document.createElement('div');
    div.classList.add('message');
    if(chat.sender==msg.clientname){
    div.style.backgroundColor="black";
    div.style.color="white";
    chat.sender="You";
    }
    div.innerHTML=`<br><p class='meta'>${chat.sender}&nbsp<span>${chat.time}<span></p><p class='test'>${chat.msg}</p>`;
    document.querySelector('.chat-messages').append(div);
})
})

//receiving from server...
sock.on('message',(msg)=>{
    output(msg);
    //console.log(msg.time);
    chat.scrollWidth=chat.scrollHeight;
})
sock.on('room_images',({image})=>{
    console.log("client",image);
    // var div=document.getElementById("image");
    // div.innerHTML=`<img src="${image}">`;
    // div.innerHTML=`<img src="${image}">`;
    var div=document.createElement("div");
    div.innerHTML=`<img src="${image.img}" height="100" width="100">&nbsp&nbsp&nbsp${image.name}`
    div.addEventListener('click',()=>{
        var modal = document.getElementById("myModal");
        var span = document.getElementsByClassName("close")[0];
        document.querySelector('.modal-body').innerHTML=`<img src="${image.img}" height="500" width="500">`;
        modal.style.display = "block";
        span.onclick = function() {
            modal.style.display = "none";
          }
          window.onclick = function(event) {
            if (event.target == modal) {
              modal.style.display = "none";
            }
          }
         
              sock.emit('image_download',image);
         
    })
    document.querySelector('.chat-messages').append(div);
})
function output(msg){
    var div=document.createElement('div');
    div.classList.add('message');
    if(sock.id==msg.id){
    div.style.backgroundColor="black";
    div.style.color="white";
    if(msg.uName!="ChatBot")
    msg.uName="You";
    }
    div.innerHTML=`<br><p class='meta'>${msg.uName}&nbsp<span>${msg.time}<span></p><p class='test'>${msg.txt}</p>`;
    document.querySelector('.chat-messages').append(div);
}

sock.on('personalmsg',(msg)=>{
    output1(msg);
    //console.log(msg.time);
    chat.scrollWidth=chat.scrollHeight;
})
function output1(msg){
    var div=document.createElement('div');
    div.classList.add('message');
    div.style.background="#7386ff"
    div.style.color="white";
    div.innerHTML=`<br><p class='meta' style="color:white">${msg.uName}&nbsp<span style="color:white">${msg.time}<span></p><p class='test'>${msg.txt}</p>`;
    document.querySelector('.chat-messages').append(div);
}

// var source=new EventSource("../views/signup.html");
// source.onmessage=function(event){
//     console.log(event.data,"ssss");
//     document.getElementById("result").innerHTML+=event.data+"<br>";
// }


  
function compare(a, b) {  
    var dateA = new Date(a.date).getTime(); 
    var dateB = new Date(b.date).getTime(); 
    return dateA > dateB ? 1 : -1;  
}; 