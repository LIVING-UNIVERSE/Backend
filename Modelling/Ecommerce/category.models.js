import mongoose from "mongoose";

const catorerySchema = new mongoose.Schema({
    category:{
        type:String,
        required:true,
    }
},{timestamps:true})

export const Category = mongoose.model("Category",catorerySchema)