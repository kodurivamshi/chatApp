const moment=require("moment");

function chatMsgformat(uName,txt){
    return {
        uName,
        txt,
        time: moment().format('h:m a')
    };
};

module.exports=chatMsgformat;