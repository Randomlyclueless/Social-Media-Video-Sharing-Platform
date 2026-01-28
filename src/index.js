// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import mongoose from "mongoose";
import {DB_name} from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})


connectDB();




















































// first approach for connecting backend

// const app = express()(async()=>{
//     try{
//        await mongoose.connect(`${process.env.MONGODB-URI}/${DB_Name}`)
//        app.on("error",()=>{
//         console.log("Error",error);
//         throw error
//        })

//        app/listen(process.env.PORT,()=>{
//         console.log(`Server is running on port ${process.env.PORT}`);
//        })

//     }catch(error){
//         console.error("Error: ",error)
//         throw err
//     }
// })()





