const express=require("express");

const app=express();
app.use(express.json());
app.use("/api/library",require("./route/route.js"));
port=5001;
app.listen(port,() =>{
    console.log("server is running...");
})