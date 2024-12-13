import mongoose from "mongoose";

const todoSchema =  new mongoose.Schema(
    {
        content:{
            type:String,
            required:true,
        },
        color:{
            type:String,
            required:true,
        },
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        completed:{
            type:Boolean,
            default:false,
        },
        subTodos:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"SubTodo",
            },
        ],
    },{timestamps:true}
)

export const Todo = mongoose.model("Todo",todoSchema)