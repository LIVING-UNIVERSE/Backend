import mongoose,{Schema,model} from "mongoose";

const likesSchema = new Schema({
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comments"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    }
},{timestamps:true})




export default Likes = model("Likes",likesSchema)