var mongoose=require("mongoose");

// var chatschema=new mongoose.Schema({
//     username:String,
//     chat:[{
//         sender:String,
//         msg:String,
//         time:String,
//     }]
// });

var chatschema=new mongoose.Schema({
    username:String,
    chat:[
        {
            username:String,
        chat:[{
        sender:String,
        msg:String,
        time:String,
    }]
}]
});


module.exports=mongoose.model('chat',chatschema);