const mongoose = require('mongoose')
const UserModel = mongoose.model('UserModel')
const jwt = require('jsonwebtoken')
const {JWT_SECRECT} = require('../config')

module.exports = (req,res,next)=>
{
    const {authorization} = req.headers;
    if(!authorization)
    {
        return res.status(401).json({error:  "User not logged In error1" });
    }
    const token = authorization.replace("Bearer ","");
    jwt.verify(token, JWT_SECRECT , (error,payload)=>{
        if(error)
        {
        return ( 
            res.status(401).json({error:  "User not logged In error2" })        )
        }
        const {_id} = payload;
         UserModel.findById(_id)
        .then(dbUser=>{
            req.dbUser = dbUser;
            next();
        });
    
        });
       
}