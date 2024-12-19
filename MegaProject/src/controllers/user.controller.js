import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
import { APIError } from "../utils/APIError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { APIresponse } from "../utils/APIresponse.js"

const generateRefreshAndAccessTokens = async (userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

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
        throw new APIError(404, "user is note registered.")
    }

    const passwordResponse = await user.isPasswordCorrect(password);


    if(!passwordResponse){
        throw new APIError(401,"Invalid Credentials");
    }

    const {accessToken,refreshToken} = generateRefreshAndAccessTokens(user._id);

    const data = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly :true,
        secure : true,
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

    User.findByIdAndUpdate(userID, 
        {
            $set:{
                refreshToken:undefined
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

export {registerUser,loginUser,logoutUser}

