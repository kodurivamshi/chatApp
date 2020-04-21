const a=[];

function joinuser(id,username,room){
    const user={id,username,room};
    a.push(user);
    return user;
}

function getuser(id){
    return a.find(user=>id==user.id);
}

function getid(name){
    console.log(name);
    return a.find(user=>name==user.username);
}

function leaveuser(id){
    var index=a.findIndex(user=>id==user.id);
    if(index!=-1){
        return a.splice(index,1)[0];
    }
}

function roomusers(room){
    return a.filter(user=>user.room==room);
}


module.exports={
    joinuser,
    getuser,
    leaveuser,
    roomusers,
    getid
}