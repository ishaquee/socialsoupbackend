const express = require('express');
const mongoose = require("mongoose"); 
const cors = require("cors")
const app = express()
const BEPORT = 3001 || process.env.PORT
const {MONGODB_URI} = require('./config')

app.use(function (req, res, next) 

{

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

mongoose.connect(MONGODB_URI);
mongoose.connection.on('connected',()=>{
    console.log("connected sussesfully")
})

mongoose.connection.on('error',(error)=>{
    console.log("connection error" , error)
})

app.use(cors({
    origin: ["*"],
    methods: ["GET", "POST", "DELETE","PUT"],
    credentials: true,
    origin: true,
})) 
// Use this after the variable declaration
app.use(express.json());


require('./models/user_model')
require('./models/post_model')
require('./models/Conversation')
require('./models/Message')
app.use(require('./routes/Authentication'))
app.use(require('./routes/postRoute'))
app.use(require('./routes/UserRoutes'))
app.use(require('./routes/nlp'))
app.use('/api/conversation',require('./routes/conversation'))
app.use('/api/message',require('./routes/message'))


app.listen(process.env.PORT ||  BEPORT,()=>{
    console.log("server started !!!")
})