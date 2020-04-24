const moment=require("moment");
const d=new Date();

function chatMsgformat(id,uName,txt){
    return {
        id,
        uName,
        txt,
        time: d.getHours()+":"+d.getMinutes(),
    };
};

module.exports=chatMsgformat;