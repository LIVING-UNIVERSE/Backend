import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
import { APIError } from "../utils/APIError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { APIresponse } from "../utils/APIresponse.js"
import jwt from 'jsonwebtoken';
import mongoose from "mongoose"

const generateRefreshAndAccessTokens = async (userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        console.log("accessToken",accessToken);
        console.log("refreshToken",refreshToken)

        user.refreshToken= refreshToken;
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken};
    } 
    catch (error) {
        throw new APIError(501,"something went wrong while generating accessToken or refreshToken.")
    }
}


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

const loginUser = asyncHandler(async(req,res)=>{
    //get data from user
    // if data doesn't exits send error
    // check for registered user
    // password check
    // generate access and refresh tokens
    // send cookie and response

    const {username,email,password} = req.body;

    if(!username && !email){
        throw new APIError(400,"username or email is required");
    }

    const user = await User.findOne({$or:[{username},{email}]})

    if(!user){
        throw new APIError(404, "user is not registered.")
    }

    const passwordResponse = await user.isPasswordCorrect(password);


    if(!passwordResponse){
        throw new APIError(401,"Invalid Credentials");
    }

    const {accessToken,refreshToken} = await generateRefreshAndAccessTokens(user._id);

    const data = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new APIresponse(201,
            {
                user: data,accessToken,refreshToken
            },
            "User is Successfully Loged in.")
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    const userID = req.user._id;

    // const user = await User.findById(userID);
    // user.refreshToken=undefined;
    // await user.save({validateBeforeSave:false})

    await User.findByIdAndUpdate(userID, 
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true,
        }
    )

    const options={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(208)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json( new APIresponse(200,{},"User logged out!"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if(!token){
        throw new APIError(401, "Unauthorized access");
    }

    const decodedToken =  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id);
    if(!user){
        throw new APIError(403,"invalid refresh Token.");
    }

    if(token !== user?.refreshToken){
        throw  new APIError(404," Refresh Token in either expired or used.")
    }

    const {accessToken,refreshToken} = await generateRefreshAndAccessTokens(user._id)

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(201)
    .cookie("accessToken", accessToken,options )
    .cookie("refreshToken", refreshToken, options)
    .json(
        new APIresponse(200, 
            {
                user:user,accessToken,refreshToken
            },
            "accessToken regenerated successfully."
        )
    )
})

const changeCurrentPassword = asyncHandler( async(req,res)=>{
    const {oldPassword,newPassword} = req.body;
    if(oldPassword === newPassword){
        throw new APIError(201,"New password is same as current password.")
    }

    const user = await User.findById(req.user?._id);

    const checkPassword = await user.isPasswordCorrect(oldPassword)
    if(!checkPassword){
        throw new APIError(202,"Invalid current Password!")
    }

    user.password = newPassword;
    user.save({validateBeforeSave:false});

    return res
    .status(201)
    .json( new APIresponse(200,{newPassword},"Password Change Successfully."))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new APIresponse(200,req.user,"Current User fetched Successfully.")
    )
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body
    if(!fullName || !email){
        throw new APIError(401,"Full Name and email is required!")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, 
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new APIresponse(200,user,"User details are updated.")
    )

})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new APIError(401, "Avatar file is missing.")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new APIError(403,"Something went wrong while uploading avatar file.")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true,
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new APIresponse(201,user,"Avatar file uploaded successfully.")
    )

}) 

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new APIError(401, "Cover Image file is missing.")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage){
        throw new APIError(403,"Something went wrong while uploading cover image file.")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true,
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new APIresponse(201,user,"Cover Image file uploaded successfully.")
    )

}) 

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params;
    if(!username?.trim()){
        throw new APIError(400, "Username not found!")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscribers",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                subscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                username:1,
                email:1,
                fullName:1,
                subscribersCount:1,
                subscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1
            }
        }
    ])
    console.log("channel:",channel);

    if(!channel?.length){
        throw new APIError(404,"Channel does not exist");
    }

    return res.
    status(200)
    .json(
        new APIresponse(200,channel[0],"User channel fetched successfully!")
    )
})

const getWatchHistory =asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }

    ])
    console.log("userWatchHistory:",user)

    return res
    .status(200)
    .json(
        new APIresponse(201,user[0].WatchHistory,"Watch History is fetched successfully.")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}

