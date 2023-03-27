import express from "express"
import path from "path"
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName:"backend",
})
.then((c)=>console.log("Database Connected"))
.catch((e)=>console.log(e))

//creating schema for database(NoSQL)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

// Creating Collection For schema
const User = mongoose.model("User", userSchema);



const indexFile = path.join(path.resolve() , "./public")

// console.log(indexFile);

// const users = [];

// using middleware
app.use(express.static(indexFile))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser());

//setting up views engine
app.set("view engine", "ejs")

const isAuthenticated = async (req, res, next)=>{
    const {token} = req.cookies;
    if(token){

        const decoded = jwt.verify(token, "shdshdhdshh")
        req.user = await User.findById(decoded._id)

        next();
    }
    else{
        res.redirect("/login")
    }
}

app.get("/", isAuthenticated, (req,res)=>{
    // console.log(req.user);
    res.render("logout", {name: req.user.name})
})

app.get("/register", (req,res)=>{
    res.render("register")
})


app.get("/logout", (req, res)=>{
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.redirect("/")
})

app.get("/login", (req, res)=>{
    res.render("login")
})

app.post("/login", async (req, res)=>{
    const {email, password} = req.body;
    let user = await User.findOne({email});
    if(!user) return res.redirect("/register")
    
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.render("login", {email, message: "Incorrect Password"})

    const token = jwt.sign({_id:user._id}, "shdshdhdshh");

    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now()+60*1000),
    });
    res.redirect("/");
})

app.post("/register", async (req, res)=>{

    const {name,email,password} = req.body;

    let user = await User.findOne({email});
    if(user){
        return res.redirect("/login");
    }

    const hashedPass = await bcrypt.hash(password, 10);

    user = await User.create({
        name,
        email,
        password: hashedPass,
    })

    const token = jwt.sign({_id:user._id}, "shdshdhdshh");
    // console.log(token);

    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now()+60*1000),
    });
    res.redirect("/");
})


app.get("/add", async (req, res)=>{
    await message.create({
        name: "Nikhil455",
        email: "nnnnikhil6@gmail.com",
        password: "nikh6655ilku",
    })
    .then((c)=>{
        res.send("Data is added successfully")
    })
    .catch((e)=>{
        res.send(e);
    })
    // res.send("Nice")
})



app.listen(5000, ()=>{
    console.log("Server is working...");
})