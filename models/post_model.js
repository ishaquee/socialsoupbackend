const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    likes: [ {
        type: ObjectId,
        ref: "UserModel"
    }],
    comments: [
        {
        CommentText: String,
        CommentedBy : { type : ObjectId ,  ref: "UserModel"},
        time : { type : Date}

        }
    ],
    author: {
        type: ObjectId,
        ref: "UserModel"
    }
},{timestamps:true});

mongoose.model("PostModel", postSchema);