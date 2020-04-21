var mongoose=require("mongoose");

var roomschema=new mongoose.Schema({
    roomName:{
        type:String,
        required:true}
})

module.exports=mongoose.model("room",roomschema);