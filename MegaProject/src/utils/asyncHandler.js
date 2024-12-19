const asyncHandler = (requestHandler)=>(req,res,next)=>{
    return Promise.resolve(requestHandler(req,res,next))
    .catch((error)=>next(error))
}


export default asyncHandler


// higher order function
// const asyncHandler = (fun)=> async()=>{}

// const asyncHandler = (fun)=>async(req,res,next)=>{
//     try {
//         await fun(req,res,next)
//     } catch (error) {
//         res.status(error.code ||500).json({
//             success:false,
//             message:error.message,
//         })
//     }
// }