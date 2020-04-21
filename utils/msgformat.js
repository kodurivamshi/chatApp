const moment=require("moment");

function chatMsgformat(id,uName,txt){
    return {
        id,
        uName,
        txt,
        time: moment().format('h:m a')
    };
};

module.exports=chatMsgformat;