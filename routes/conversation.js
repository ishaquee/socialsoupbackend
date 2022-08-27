const express = require('express')
const router = express.Router();
const  mongoose  = require('mongoose');

const Conversation = mongoose.model('Conversation');

router.post('/',async(req,res)=>{
    const newConversation = new Conversation({
        members:[
            req.body.senderId,req.body.reciverId
        ]
    });
    try{
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation)
        
    }catch(err){
        res.status(500).json(err)
    }
})

router.post('/checkandcreate',async(req,res)=>{

    const founded = await Conversation.find({
        $and:[
        {"members.0":[req.body.senderId]},
        {"members.1":[req.body.reciverId]}]
    });
    if(founded.length > 0)
    {
        res.status(200).json(founded)
    }
    else{
        const foundednew = await Conversation.find({
            $and:[
            {"members.1":[req.body.senderId]},
            {"members.0":[req.body.reciverId]}]
        });  
        if(foundednew.length > 0){
            res.status(200).json(foundednew)
        }
        else{
    const newConversation = new Conversation({
        members:[req.body.senderId,req.body.reciverId],
    });
    try{
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation)
    }catch(err){
        res.status(500).json(err)
    } } }
})

router.get('/:userId',async(req,res)=>{
    try{
        const savedConversation = await Conversation.find({
            members:{$in :[req.params.userId]}
        }).sort({"updatedAt": -1})
        res.status(200).json(savedConversation)
        
    }catch(err){
        res.status(500).json(err)
    }
})

router.get('/member/:userId',async(req,res)=>{
    try{
        const savedConversation = await Conversation.find({
            _id:{$in :[req.params.userId]}
        })
        .sort({updatedAt: -1})
        res.status(200).json(savedConversation)
        
    }catch(err){
        res.status(500).json(err)
    }
})


module.exports = router;