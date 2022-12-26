const mysql=require("mysql");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const async = require("hbs/lib/async");
const {promisify}=require("util");

const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE,
});

exports.login=async (req,res)=>{
    try{
        const roll=req.body.roll;
        const password=req.body.password;
        if(!roll && !password){
            return res.status(400).render('login',{
                message:"Please provide roll number and password",
            });
        }
        else if(!roll){
            return res.status(400).render('login',{
                message:"Please provide roll number",
            });
        }
        else if(!password){
            return res.status(400).render('login',{
                message:"Please provide password",
            });
        }

        db.query("select * from users where roll=?",[roll],async(error,results)=>{
            if(error){
                console.log(error);
            }
            else{
                console.log(results);
            }
            if(!results || !(await bcrypt.compare(password,results[0].password))){
                res.status(401).render('login',{
                    message:"Email or Password is Incorrect",
                });
            }
            else{
                const roll=results[0].roll;
                const token=jwt.sign({roll},process.env.JWT_SECRET,{
                    expiresIn: process.env.JWT_EXPIRES_IN,
                });
                console.log("the token is "+token);
                const cookieOptions={
                    expires:new Date(Date.now+process.env.JWT_COOKIE_EXPIRES*24*60*60*1000),
                    httpOnly:true,
                }
                res.cookie('jwt',token,cookieOptions);
                res.status(200).redirect("/");
            }
        })
    }
    catch(error){
        console.log("error");
    }
}

exports.register=(req,res)=>{
    console.log(req.body);

    const name=req.body.name;
    const roll=req.body.roll;
    const password=req.body.password;
    const passwordConfirm=req.body.passwordConfirm;

    db.query("select roll from users where roll=?",[roll],async(error,results)=>{
        if(error){
            console.log("error");
        }
        if(results.length>0){
            return res.render("register",{
                message:"Roll Number is taken",
            });
        }
        else if(password!==passwordConfirm){
            return res.render("register",{
                message:"Both passwords don't match",
            });
        }

        let hashedPass=await bcrypt.hash(password,2);
        console.log(hashedPass);

        db.query("insert into users set ?",{name:name,roll:roll,password:hashedPass},(error,results)=>{
            if(error){
                console.log(error);
            }
            else{
                console.log(results);
                return res.render("register",{
                    message:"User Registered",
                });
            }
        });
    });
}

//next means it renders profile page if true
exports.isLoggedIn=async(req,res,next)=>{
    // req.message="Inside Middleware";

    console.log(req.cookies);
    if(req.cookies.jwt){
        try{
            // whether cookie exists or not
            const decoded=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
            console.log(decoded);

            // user exists or not
            db.query("select * from users where roll=?",[decoded.roll],(error,results)=>{
                console.log(results);
                if(!results){
                    return next();
                }
                req.user=results[0];
                return next();
            });
        }
        catch(error){
            console.log(error);
            return next();
        }
    }
    else{
        next();
    }
}

exports.logout=async(req,res)=>{
    res.cookie("jwt","logout",{
        expires:new Date(Date.now()+2*1000),
        httpOnly:true
    });
    res.status(200).redirect("/");
}