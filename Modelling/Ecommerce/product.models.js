import mongoose from "mongoose";

const porductSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    productImage:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
        default:0,
    },
    stock:{
        type:Number,
        default:0,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
    },
    Owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }

},{timestamps:true})

export const Product = mongoose.model("Product",porductSchema)