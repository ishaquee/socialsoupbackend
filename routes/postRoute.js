const express  = require('express');
const  mongoose  = require('mongoose');
const router = express.Router();
const PostModel = mongoose.model('PostModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECRECT} = require('../config')


const ProtectedResources = require('../middleware/ProtectedResources')

router.get('/posts',ProtectedResources,(req,res)=>{
    PostModel.find()
    .populate("author","_id fullName profilePicUrl isPrivate following followers")
    .populate("comments.CommentedBy" , "_id fullName")
    .sort("-createdAt")
    .then((dbPosts)=>{
        res.status(200).json({posts:dbPosts});
    }).catch(error=> console.log(error));
});


router.get('/postsfromfollowing', ProtectedResources, (req, res) => {
    PostModel.find({ author: { $in: req.dbUser.following } })
        .populate("author", "_id fullName profilePicUrl")
        .populate("comments.CommentedBy", "_id fullName profilePicUrl") 
         .sort("-createdAt")
        .then((dbPosts) => {
            res.status(200).json({ posts: dbPosts });
        })
        .catch((error) => {
            console.log(error);
        });
});
router.get('/mysavedpost', ProtectedResources, (req, res) => {
    PostModel.find({ _id: { $in: req.dbUser.savedPost } })
        .populate("author", "_id fullName profilePicUrl")
         .sort("-createdAt")
        .then((dbPosts) => {
            res.status(200).json({ posts: dbPosts });
        })
        .catch((error) => {
            console.log(error);
        });
});


router.get('/myposts',ProtectedResources,(req,res)=>{
    PostModel.find({ author : req.dbUser._id })
    .populate("author","_id fullName")
    .populate("comments.CommentedBy" , "_id fullName")
    .sort("-createdAt")
    .then((dbPosts)=>{
        res.status(200).json({posts:dbPosts});
    }).catch(error=> console.log(error));
});

router.get('/c/:postId',(req,res)=>{
    PostModel.find({ _id : req.params.postId })
    .select("comments")
    .populate("comments.CommentedBy" , "_id fullName time")
    .sort({"time": -1})
        .then(result => res.json(result))
        .catch(error=> console.log(error));
});

router.post('/createpost',ProtectedResources,(req,res)=> {
    const {title , body , image } = req.body
    if(!title || !body || !image)
    {
        return res.status(400).json({error: "one or more fiels are empty" });
    }    
    const post = new PostModel({title: title,body : body,image : image , author :req.dbUser});
    post.save()
    .then((dbUser)=>{
        res.status(201).json({post: dbUser});
    })
    .catch(error=> console.log(error))
    });


    
    router.put('/like',ProtectedResources,(req,res)=>{
        PostModel.findByIdAndUpdate(req.body.postId,{
            $push: {likes : req.dbUser._id}
        },
        {
            new: true
        })
        .populate("comments.CommentedBy" , "_id fullName")
        .populate("author","_id fullName profilePicUrl")
        .exec((error,result)=>
        {
            if(error)
            {
                return res.status(400).json({error: error})
            }
            else{
                res.json(result)
            }
        })
    })    
   
    router.put('/unlike',ProtectedResources,(req,res)=>{
        PostModel.findByIdAndUpdate(req.body.postId,{
            $pull: {likes : req.dbUser._id}
        },
        {
            new: true
        })
        .populate("comments.CommentedBy" , "_id fullName")
        .populate("author","_id fullName profilePicUrl")
        .exec((error,result)=>
        {
            if(error)
            {
                return res.status(400).json({error: error})
            }
            else{
                res.json(result)
            }
        })
    })  
    

    router.put('/comment',ProtectedResources,(req,res)=>{

        const comment =  {
            CommentText : req.body.commentText,
            CommentedBy : req.dbUser._id,
            time: Date.now()   
        }
        PostModel.findByIdAndUpdate(req.body.postId,{
            $push: {comments : comment}
        },
        {
            new: true
        })
    .select("comments createdAt")
    .populate("comments.CommentedBy" , "_id fullName time")
    .sort("-time")
        .exec((error,result)=>
        {
            if(error)
            {
                return res.status(400).json({error: error})
            }
            else{
                res.json(result)
            }
        })
    })    


router.delete("/delete/:postId",ProtectedResources,(req,res)=>{
    PostModel.findOne({_id: req.params.postId})
    .populate("author","_id")
    .exec((error,post)=>{
        if(error || !post)
        {
            return res.status(400).json({error: error})
        }
        if(post.author._id.toString() === req.dbUser._id.toString())
        {
            post.remove()
            .then((data)=>{
                res.send({result: data})
            })
            .catch((e)=>{
                console.log(e)
            })
        }
    })

}) 

router.put("/cdelete/",(req,res)=>{
   
   PostModel.findOneAndUpdate( // select your doc in moongo
        { _id: req.body.postId},{$pull : {comments : {_id : req.body.commentId}}},{new:true})
        .select("comments createdAt time")
        .populate("comments.CommentedBy" , "_id fullName time")
        .sort("-time")       
         .then(result => res.json(result))
        .catch(error => {
            return res.status(400).json({ error: error })
        }) 
        // set this to true if you want to remove multiple elements.c
});
    
module.exports = router;