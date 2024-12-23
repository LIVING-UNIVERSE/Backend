import mongoose,{Schema,model} from "mongoose";
import { Video } from "./video.models";

const playlistScheme = new Schema({
    name:{
        type:String,
        requried:true,
        unique:true,
        index:true
    },
    description:{
        type:String,
        requried:true
    },
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export default Playlist = model("Playlist",playlistScheme)