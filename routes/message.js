const express = require('express')
const router = express.Router();
const  mongoose  = require('mongoose');

const MessageModel = mongoose.model('Message');
const Conversation = mongoose.model('Conversation');

router.post('/',(req,res)=> {
    const {sender , text , conversationId ,type} = req.body
    console.log(sender + text + conversationId + type) 
    if(!sender || !text || !conversationId)
    {
        return res.status(400).json({error: "one or more fiels are empty" });
    }  
   
    Conversation.updateOne({_id:req.body.conversationId}, {$set:{"lastmessage":req.body.text,"lastmessageby":req.body.sender}}, function(err, result) {
        if (err)
        {
            console.log(err);
        }
        else{
            console.log(result);
        }
            //do something.
    });
    
    const savedMessage = new MessageModel({sender,text,conversationId,type});
    savedMessage.save()
    .then(()=>{
        res.status(201).json({message: savedMessage}); 
    })
    .catch(error=> console.log(error))
    });


router.get('/:conversationId',async (req,res)=> {
    try{
        const Message = await MessageModel.find({ $and :[
           {conversationId: req.params.conversationId},
           {createdAt : 
           {     
               $gte:   new Date(new Date().setHours(00,00,00)) ,     
               $lt :  new Date(new Date().setHours(23,59,59)) 
          }}]
        });
        res.status(200).json(Message)
    }
    catch(err){
        res.status(500).json(err)
    }
})


module.exports = router;