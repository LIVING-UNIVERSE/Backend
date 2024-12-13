import mongoose from "mongoose";

const patientSchema = new mongoose.SchemaType({
    name:{
        type:String,
        required:true,
    },
    diagonsedWith:{
        type:String,
        required:true,
    },
    age:{
        type:Number,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    bloodGroup:{
        type:String,
        required:true,
    },
    admittedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hospital",
    },
    gender:{
        type:String,
        enum:["M",'F','O'],
        required:true,
    }

},{timestamps:true})

export const Patient = mongoose.model("Patient",patientSchema)