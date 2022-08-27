const express  = require('express');
const  mongoose  = require('mongoose');
const router = express.Router();
const UserModel = mongoose.model('UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECRECT} = require('../config')
let alert = require('alert'); 
const sgMail = require('@sendgrid/mail')
const crypto = require('crypto')
sgMail.setApiKey('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')

router.post('/login',(req,res)=>{
    const {emailorpass , password ,} = req.body
    if(!emailorpass || !password)
    {
        return res.status(400).json({error:  "one or more fiels are empty" });
    }
    alert("Plese Wait :)")
    if(emailorpass.includes('@'))
    {
    UserModel.findOne({email:emailorpass})
    .then((dbUser)=>{
        if(!dbUser)
        {
            return res.status(400).json({error:  "Invalid crenditials.." });
        }
        email  = emailorpass.toLowerCase();
        bcrypt.compare(password,dbUser.password)
        .then((didpasswordmatch)=>{
            if(didpasswordmatch)
            {
                //return res.status(200).json({result:  "User Successfully logged in .." });
                const jwtToken = jwt.sign({ _id: dbUser._id }, JWT_SECRECT,{expiresIn:3600});
                const { _id, fullName, email, followers, following , profilePicUrl,isPrivate,Requested,username,savedPost } = dbUser;
                res.json({ token: jwtToken, userinfo: { _id, fullName, email, followers, following,profilePicUrl,isPrivate,Requested,username,savedPost } });
            }
            else{
                return res.status(400).json({error:  "Invalid crenditials.." });
            }
        });
            }).catch((error)=>{
                    console.log(error);
            });
    }
    else{

    UserModel.findOne({username:emailorpass})
    .then((dbUser)=>{
        if(!dbUser)
        {
            return res.status(400).json({error:  "Invalid crenditials.." });
        }
        bcrypt.compare(password,dbUser.password)
        .then((didpasswordmatch)=>{
            if(didpasswordmatch)
            {
                //return res.status(200).json({result:  "User Successfully logged in .." });
                const jwtToken = jwt.sign({ _id: dbUser._id }, JWT_SECRECT,{expiresIn:3600});
                const { _id, fullName, email, followers, following , profilePicUrl,username,isPrivate,Requested,savedPost } = dbUser;
                res.json({ token: jwtToken, userinfo: { _id, fullName, email, followers, following,profilePicUrl,username,isPrivate,Requested,savedPost } });
            }
            else{
                return res.status(400).json({error:  "Invalid crenditials.." });
            }
        });
            }).catch((error)=>{
                    console.log(error);
            });
        }
});

router.post('/register',(req,res)=> {
    const {fullName , email , password , profilePicUrl,username} = req.body
    if(!fullName || !email || !password || !username)
    {
        return res.status(400).json({error:  "one or more fiels are empty" });
    }
    alert("Plese Wait :)")
    const email1  = email.toLowerCase();
    UserModel.findOne({email:email1})
    .then((dbUser)=>{
        if(dbUser)
        {
            return res.status(500).json({error:  "User email id already exits.." });
        }
        UserModel.findOne({username : username}).then((dbUser)=> {
            if(dbUser)
            {
                return res.status(500).json({error:  "User Name already exits.." });
            }
        })
        bcrypt.hash(password,16)
        .then((hashedpassword)=>{
            const user = new UserModel({fullName,email:email1,password:hashedpassword,profilePicUrl :profilePicUrl,username : username});
            user.save()
        .then((u)=>{
            const msg = {
                to: u.email, // Change to your recipient
                from: 'ishaquemohamed5@gmail.com', // Change to your verified sender
                subject: 'signup successfully',
                html: '<h1> welcome to instaclone <h1/>',
                text:'Share your happiness here !! '
              }
                sgMail
                .send(msg)
                     .then(() => {
                        console.error("Email sent successfully !")
                    })
                .catch((error) => {
                     console.error(error)
                     res.status(400).json({error});
                            })
            res.status(201).json({result:  "User Registration Successfully !!" });
        })
        .catch((error)=>{
            console.log(error);
        });

        });           
    }).catch((error)=>{
        console.log(error);
    });  
})


router.post('/resetpassword',(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        email1  = req.body.email.toLowerCase();
        UserModel.findOne({email: email1})
        .then(user=>{
            if(!user){
                return res.status(422).json({error:"User dont exists with that email"})
            }
            user.resetToken = token
            user.expireToken = Date.now() + 3600000
            user.save().then((result)=>{
                sgMail.send({
                    to:user.email1,
                    from:"ishaquemohamed5@gmail.com",
                    subject:"password reset",
                    html:`
                    <p>You requested for password reset</p>
                    <h5>click in this <a href="https://instaclone022.herokuapp.com/reset/${token}">link</a> to reset password</h5>
                    `
                })
                res.json({message:"check your email"})
            })

        })
    })
})

router.post('/new-password',(req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    UserModel.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Try again session expired"})
        }
        bcrypt.hash(newPassword,16).then(hashedpassword=>{
           user.password = hashedpassword
           user.resetToken = undefined
           user.expireToken = undefined
           user.save().then((saveduser)=>{
               res.json({message:"password updated success"})
           })
        })
    }).catch(err=>{
        console.log(err)
    })
})


router.post('/updatepass',(req,res)=>{
    const {email,oldpass,newpass} = req.body
    if(!email || !oldpass || !newpass){
       return res.status(422).json({error:"please add email or password"})
    }
    UserModel.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
           return res.status(422).json({error:"Invalid Email User"})
        }
        bcrypt.compare(oldpass,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                bcrypt.hash(newpass,12).then(hashedpassword=>{
                                savedUser.password = hashedpassword
                               savedUser.save().then((saveduser)=>{
                                    res.json({message:"password updated success"})
                                })
                             })
            }
            else{
                return res.status(422).json({error:"Wrong old Password !! , Try Again"})
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
})


module.exports = router;