const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const ConversationSchema = new mongoose.Schema(
    {
        members:{
            type: Array,
        },
        lastmessage:{
            type: String,
            default:''
        },
        lastmessageby:{
            type: String,
        }
    },
{timestamps:true}

);

mongoose.model("Conversation", ConversationSchema);