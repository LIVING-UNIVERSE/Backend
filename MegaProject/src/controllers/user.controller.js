import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
import { APIError } from "../utils/APIError.js"
import { User } from "../models/user.models.js"
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

    if(User.findOne({
        $or:[{username},{email}]
    })){
        throw new APIError(409,"User with email or usename already exists")
    }

    const avatarLocalPath =req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new APIError(400,"Avatar file is required.")
    }
    
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
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

    const createdUser = User.findById(user._id);
    if(!createdUser){
        throw new APIError(500,"something went wrong while registering the user.");
    }
    else{
        createdUser.select("-password -refreshToken");
    }


    return res.status(201).json(
        new APIresponse('200',createdUser,"User register successfully.")
    )
})

export {registerUser}