var mongoose=require("mongoose");
var roomchatschema=new mongoose.Schema({
    roomName:String,
    roomchat:[{
        sender:String,
        msg:String,
        time:String,
    }]
});
module.exports=mongoose.model('roomchat',roomchatschema);