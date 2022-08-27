const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const protectedResource = require('../middleware/ProtectedResources');
const PostModel = mongoose.model("PostModel");
const UserModel = mongoose.model("UserModel");

//endpoint to get user details of another user(not the loggedin user) along with their posts
router.get('/user/:userId', protectedResource, (req, res) => {
    //to find the specific user
    UserModel.findOne({ _id: req.params.userId })
        .select("-password")//fetche everything except password
        .then((userFound) => {
            //fetch all posts of this found user
            PostModel.find({ author: req.params.userId })
                .populate("author", "_id fullName")
                .exec((eror, allPosts) => {
                    if (eror) {
                        return res.status(400).json({ error: eror });
                    }
                    res.json({ user: userFound, posts: allPosts })
                })
        })
        .catch((err) => {
            return res.status(400).json({ error: "User was not found!" })
        })
});

router.get('/api/user/:userId', protectedResource, (req, res) => {
    //to find the specific user
    UserModel.findOne({ _id: req.params.userId })
        .select("-password")//fetche everything except password
        .then((userFound) => {
            //fetch all posts of this found user
                    res.json({ user: userFound})
                })
        .catch((err) => {
            return res.status(400).json({ error: "User was not found!" })
        }) 
});



router.get('/p/:postId', (req, res) => {
    //to find the specific user
    PostModel.findOne({ _id: req.params.postId })
        .select("-password")//fetche everything except password
        .populate("author","_id fullName profilePicUrl isPrivate following")
    .populate("comments.CommentedBy" , "_id fullName")
    .then((dbPosts)=>{
        res.status(200).json({post:dbPosts});
    })        .catch((err) => {
            return res.status(400).json({ error: "Post was not found!" })
        })
});

router.get('/followers/:profileId', (req, res) => {
    //to find the specific user
    UserModel.findOne({ _id: req.params.profileId })
        .select("-password")//fetche everything except password
        .then((userFound) => {
            //fetch all posts of this found user
            UserModel.find({ _id: userFound.followers })
            .select("following followers profilePicUrl username")//fetche everything except password
                .exec((eror, allPosts) => {
                    if (eror) {
                        return res.status(400).json({ error: eror });
                    }
                    res.json({followers: allPosts })
                })
        })
        .catch((err) => {
            return res.status(400).json({ error: "User was not found!" })
        })
});

router.get('/followings/:profileId', (req, res) => {
    //to find the specific user
    UserModel.findOne({ _id: req.params.profileId })
        .select("-password")//fetche everything except password
        .then((userFound) => {
            //fetch all posts of this found user
            UserModel.find({ _id: userFound.following })
            .select("following followers profilePicUrl username")//fetche everything except password
                .exec((eror, allPosts) => {
                    if (eror) {
                        return res.status(400).json({ error: eror });
                    }
                    res.json({followings: allPosts })
                })
        })
        .catch((err) => {
            return res.status(400).json({ error: "User was not found!" })
        })
});



router.get('/user/findme/:userId', protectedResource, (req, res) => {
    //to find the specific user
    UserModel.findOne({ _id: req.params.userId })
        .select("fullName")//fetche everything except password
        .then((userFound) => {
            res.status(200).json({fullName : userFound})
        })
        .catch((err) => {
            return res.status(400).json({ error: "User was not found!" })
        })
});



router.put('/follow', protectedResource, (req, res) => {
    //Scenario: Loggedin user is trying to follow a non-loggedin user

    //req.body.followId = userId of not loggedin user
    UserModel.findByIdAndUpdate(req.body.followId, {
        $push: { followers: req.dbUser._id }//push the userid of loggedin user
    }, {
        new: true
    }, (error, result) => {
        if (error) {
            return res.status(400).json({ error: error })
        }
        //req.dbUser._id = userId of loggedin user
        UserModel.findByIdAndUpdate(req.dbUser._id, {
            $push: { following: req.body.followId }//push the userid of not loggedin user
        },
            { new: true })
            .select("-password")
            .then(result => res.json(result))
            .catch(error => {
                return res.status(400).json({ error: error })
            })
    })
});

router.put('/approve',protectedResource, (req, res) => {
        UserModel.findOneAndUpdate(
            { _id: req.body.my }, 
            { $push: { "ApprovedIds" : req.body.approveid
             }})
            .then(result => res.json(result))
            .catch(error => {
                return res.status(400).json({ error: error })
            })
});
router.put('/save',protectedResource, (req, res) => {
        UserModel.findOneAndUpdate(
            { _id: req.body.my }, 
            { $push: { "savedPost" : req.body.postId
             }},
             {new : true})
            .then(result => res.json(result.savedPost))
            .catch(error => {
                return res.status(400).json({ error: 'error at 87'+error })
            })
});


router.put('/unsave', protectedResource,(req, res) => {
    UserModel.findOneAndUpdate(
        { _id: req.body.my }, 
        { $pull: { "savedPost" : req.body.postId
         }},
         {new : true})
        .then(result => res.json(result.savedPost))
        .catch(error => {
            return res.status(400).json({ error: 'error at 87'+error })
        })
});


router.put('/request',protectedResource, (req, res) => {
    UserModel.findOneAndUpdate(
        { _id: req.body.request }, 
        { $push: { "Requested" : {
            id: req.body.my,
            username: req.body.Uname
         }}},
        {new : true})
        .then(result => res.json(result))
            .catch(error => {
                return res.status(400).json({ error: error })
            })
});
router.put('/requestid',protectedResource, (req, res) => {
        UserModel.findOneAndUpdate(
            { _id: req.body.request }, 
            { $push: { "RequestIds" : req.body.my
             }},
            {new : true})
            .then(result => res.json(result))
            .catch(error => {
                return res.status(400).json({ error: error })
            })
});

router.put('/unrequest', protectedResource, (req, res) => {
    UserModel.findOneAndUpdate(
        { _id: req.body.request }, 
        { $pull: { Requested : {
            id: req.body.my,
            username: req.body.Uname
         }}},
        {new : true})
        .then(result => res.json(result))
        .catch(error => {
            return res.status(400).json({ error: error })
        }) 
});
router.put('/unrequestid', protectedResource, (req, res) => {   
        UserModel.findOneAndUpdate(
            { _id: req.body.request }, 
            { $pull:  {"RequestIds" : req.body.my
        }},
        {new : true})
        .then(result => res.json(result))
        .catch(error => {
            return res.status(400).json({ error: error })
        }) 
});
router.put('/removerequest', protectedResource, (req, res) => {
    UserModel.findByIdAndUpdate(
        { _id: req.body.my }, 
        { $set: { Requested: []  } },
        { $set: { RequestIds: []  } },
        {new : true})
        .then(result => res.json(result))
        .catch(error => {
            return res.status(400).json({ error: error })
        }) 
});

router.put('/unfollow', protectedResource, (req, res) => {
    //Scenario: Loggedin user is trying to follow a non-loggedin user

    //req.body.followId = userId of not loggedin user
    UserModel.findByIdAndUpdate(req.body.unfollowId, {
        $pull: { followers: req.dbUser._id }//push the userid of loggedin user
    }, {
        new: true
    }, (error, result) => {
        if (error) {
            return res.status(400).json({ error: error })
        }
        //req.dbUser._id = userId of loggedin user
        UserModel.findByIdAndUpdate(req.dbUser._id, {
            $pull: { following: req.body.unfollowId }//push the userid of not loggedin user
        },
            { new: true })
            .select("-password")
            .then(result => res.json(result))
            .catch(error => {
                return res.status(400).json({ error: error })
            })
    })
});
router.put('/removeApproved', protectedResource, (req, res) => {
    //Scenario: Loggedin user is trying to follow a non-loggedin user

    //req.body.followId = userId of not loggedin user
    UserModel.findByIdAndUpdate( req.body.unfollowId, {
        $pull: { ApprovedIds: req.dbUser._id }
    })    .select("-password")
            .then(result => res.json(result))
            .catch(error => {
                return res.status(400).json({ error: error })
            })
});


router.put('/updatepic',protectedResource,(req,res)=>{
    UserModel.findByIdAndUpdate(req.dbUser._id,
        {$set:{profilePicUrl:req.body.url}},{new:true},
        (err,result)=>{
         if(err){
             return res.status(422).json({error:"pic canot post"})
         }
         res.json(result)
    })
});

router.put('/setaccount',protectedResource,(req,res)=>{
   
    UserModel.findByIdAndUpdate(req.dbUser._id,
        {$set:{isPrivate:req.body.private}},{new:true},
        (err,result)=>{
         if(err){
             return res.status(422).json({error:"cannot update"})
         }
         res.json(result.isPrivate)
    })
});



router.get('/getallrequest',protectedResource,(req,res)=>{
    UserModel.find({ _id : req.dbUser._id })
    .populate("Requested" , "id username")
     .then((dbPosts)=>{
        res.json({posts: dbPosts});
    }).catch(error=> console.log(error));
});



router.post('/search-users',protectedResource,(req,res)=>{
    let userPattern = new RegExp("^"+req.body.query)
    UserModel.find({username:{$regex:userPattern}})
    .select("-password")
    .then(user=>{
        res.json({user})
    }).catch(err=>{
        console.log(err)
    })

});

module.exports = router;