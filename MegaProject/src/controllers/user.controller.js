import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
import { APIError } from "../utils/APIError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { APIresponse } from "../utils/APIresponse.js"


const registerUser = asyncHandler(async(req,res)=>{
    // get userdata from frontend
    // validate the data - whether the fields 
    //        are empty or not
    // check if user data already exists
    // get avatar and coverImage 
    // check validation of avatar
    // upload to cloudinary - validate cloudinary for avatar
    // create user object 
    // remove password and refresh tokens form response
    // return response

    const {username,fullName,email,password} = req.body

    if([username,fullName,email,password].some((field)=>{
        field?.trim()===""
    })){
        throw  new APIError(400,"All fields are necessary")
    }

    const findUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(findUser){
        throw new APIError(409,"User with email or usename already exists")
    }

    let avatarLocalPath;
    if(req.files.avatar && Array.isArray(req.files.avatar) && req.files.avatar.length >0){
        avatarLocalPath = req.files?.avatar[0]?.path;
    }
    else{
        throw new APIError("401", "Avatar file is required.")
    }

  

    let coverImageLocalPath;
    if(req.files.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath= req.files?.coverImage[0]?.path;
    }


    if(!avatarLocalPath){
        throw new APIError(403,"Avatar file is required.")
    }
 
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new APIError(400,"Avatar file is required.")
    }
    
    const user = await User.create({
        fullName,
        username:username.toLowerCase(),
        email,
        password,
        coverImage:coverImage?.url || "",
        avatar :avatar.url,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new APIError(500,"Something went wrong while registering the user.")
    }

    
    return res.status(201).json(
        new APIresponse('200',createdUser,"User register successfully.")
    )
})

export {registerUser}

