import mongoose,{Schema,model} from "mongoose";

const tweetSchema = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export default Tweet = model("Tweet",commentSchema)