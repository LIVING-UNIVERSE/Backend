import dotenv from 'dotenv'
import connectDB from './db/index.js'

import app from './app.js'

dotenv.config({
    path:'./dotenv'
})

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("error ocurred in mongoDB connection :", error)
        throw error;
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`listening to  port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("Error in connectDB function :", error);
    throw error;
})



// import express from 'express'; 
// const app = express();

// (async()=>{
//     try {
//         await mongoose.connect(`${env.process.MONGODB_URI}/${DB_NAME}`);
//         app.on("error",(error)=>{
//             console.log("ERROR:",error);
//             throw error;
//         });
//         app.listen(env.process.PROT,()=>{
//             console.log(`listening to the port ${env.process.PORT}`)
//         })
//     } catch (error) {
//         console.error("ERROR :",error);
//         throw error;
        
//     }
// })()