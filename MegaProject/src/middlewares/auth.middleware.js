import { User } from "../models/user.models.js";
import { APIError } from "../utils/APIError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async (req, _,next)=>{
    try {
        // console.log("Cookies:", req.cookies);
        // console.log("Authorization Header:", req.header("Authorization"));

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log(token);
        
        if(!token){
            throw new APIError(401,"Unauthorized request");
        }
    
        const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new APIError(402,"Invalid user token")
        }
        req.user = user;
        
        next()
    } catch (error) {
        console.log(error);
        throw new APIError(403,error?.message||"Invalid Access Token")
    }
})