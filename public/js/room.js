document.getElementById("but").addEventListener("click",(event)=>{
    var txt=document.getElementById("roomname").value;
        var room=document.getElementById("room");
        var p=document.createElement("p");
        p.innerHTML=txt;
        var op=document.createElement("option");
        op.append(p);
        room.append(op);
    });