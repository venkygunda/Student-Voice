const express=require("express");
const mysql=require("mysql");
const dotenv=require("dotenv");
const path=require('path');
const cookieParser=require('cookie-parser');

const accountSid = 'ACb107ee97899385cd835d9a4d134854ab';
const authToken = 'b9d27310cb2c60b916633ce57b83cfb0';
const twilio=require('twilio');


dotenv.config({path:'./.env'});

const app=express();

const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE,
});

const publicDir=path.join(__dirname,'./public');
app.use(express.static(publicDir));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(cookieParser());

app.set('view engine','hbs');

db.connect((error)=>{
    if(error){
        console.log(error);
    }
    else{
        console.log("mysql connected");
    }
});

app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));



app.listen(3000,()=>{
    console.log("App is running on 3000");
});