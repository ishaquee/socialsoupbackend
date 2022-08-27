const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },
    email:[{
        type:String,
        required:true
    }],
    password:{
        type:String,
        required:true
    },
    username:{
        type: String,
        required: true
    },
    isPrivate:
    {
        type: Boolean,
        default: false
    },
    resetToken: String,
    expireToken: Date,
    profilePicUrl: {
        type: String,
        default: "https://res.cloudinary.com/instagramcloneapp/image/upload/v1633881327/picture-not-available_wb3gtb.jpg"
    },
    followers:  [{type: ObjectId,ref:"UserModel" }],
    following:  [{type: ObjectId,ref:"UserModel" }],

    Requested:[
        {
            id: ObjectId,
            username: String }],
    RequestIds:[{
        type: ObjectId
    }],
    savedPost:[{
        type: ObjectId
    }],
    ApprovedIds:[{
        type: ObjectId
    }],
    myRequestIds:[{
        type: ObjectId
    }]           
});

mongoose.model("UserModel",userSchema);