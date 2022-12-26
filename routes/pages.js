const express=require("express");
const authController=require("../controllers/auth");

const app=express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const router=express.Router();

const accountSid = 'ACb107ee97899385cd835d9a4d134854ab';
const authToken = '4f1922fb91eaa177c8da21cd42655b24';
const twilio=require('twilio');


router.get("/",authController.isLoggedIn,(req,res)=>{
    // no need of hbs
    res.render("index",{
        user:req.user
    });
});

router.get("/register",authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.render("index",{
            user:req.user
        });
    }
    else{
        res.render("register");
    }
});

router.get("/login",authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.render("index",{
            user:req.user
        });
    }
    else{
        res.render("login");
    }
});

router.get("/about",authController.isLoggedIn,(req,res)=>{
    res.render("about",{
        user:req.user
    });
});

router.get("/contact",authController.isLoggedIn,(req,res)=>{
    res.render("contact",{
        user:req.user
    });
});

router.get("/message",authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.render("message",{
            user:req.user
        });
    }
    else{
        res.redirect("login");
    }
});

router.post("/send-message",(req,res)=>{
    const msg=req.body.messageInput;
    console.log(msg);
    let output=message(msg);
    console.log(output);
    if(output===null){
        res.render("message",{
            message:"Message was not send. Try to send it again"
        });
    }
    else{
        res.render("messageSent");
    }
    // console.log(output);
    // res.render("messageSent");
    // res.send("Message sent... Redirecting to Home Page");
    // res.render("index");
});

//middle ware isLoggedIn
router.get("/profile",authController.isLoggedIn,(req,res)=>{
    // console.log(req.message);
    if(req.user){
        res.render("profile",{
            user: req.user
        });
    }
    else{
        res.redirect("login");
    }
});

async function message(msg){
    const client = new twilio(accountSid, authToken);
    let sid;
    await client.messages.create({
        messagingServiceSid: 'MGd2421e9befe9b4b44525a75d9c33b0f9',
        body: msg,
        to: '+919392752428',
        from: '+18184084586',
    }).then((message)=> sid=message.sid);
    // console.log(sid);
    return sid;
}

module.exports=router;