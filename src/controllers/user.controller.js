import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary,deleteFromCloudinary,
  getPublicIdFromUrl } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

// ============================
// Register User Controller
// ============================

const registerUser = asyncHandler(async (req, res) => {

  // Steps:
  // 1. Get user details from frontend
  // 2. Validate fields (not empty)
  // 3. Check if user already exists
  // 4. Check avatar image
  // 5. Upload images to Cloudinary
  // 6. Create user in DB
  // 7. Remove sensitive fields
  // 8. Send response

  // Extract user data from request body
  if (!req.body) {
    throw new ApiError(400, "Request body is required");
  }

  const { fullname, email, username, password } = req.body;

  console.log("email:", email);

  // ----------------------------
  // Validation: Empty Fields
  // ----------------------------
  if (
    [fullname, email, username, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // ----------------------------
  // Check if user already exists
  // ----------------------------

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with username or email already exists");
  }

  // ----------------------------
  // Get uploaded file paths
  // ----------------------------
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // Avatar is mandatory
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // ----------------------------
  // Upload to Cloudinary
  // ----------------------------
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // ----------------------------
  // Create User in Database
  // ----------------------------
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(),
    password
  });

  // ----------------------------
  // Remove sensitive fields
  // ----------------------------
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // ----------------------------
  // Send Success Response
  // ----------------------------
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
  );

});

const loginUser = asyncHandler(async (req, res) => {

  //  1: Take user data
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or Email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // check if the input value has either username or email
  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  // chekc if user exists in db
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  // send cookies
  //   Cookies are small pieces of data that a website stores inside your browser.
  // They help the server remember you between requests.

  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User loggedIn successfully"
      )
    );

});

const logoutUser = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));

});

const refreshAccessToken = asyncHandler(async (req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
      throw new ApiError(401,"Unauthorized request")
    }
   try{ constdecodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401,"Invalid refresh Token")
    }
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used")
    }
    const options = {
      httpOnly:true,
      secure:true
    }

    const{accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken,refreshToken : newRefreshToken}

      )
    )}
    catch(error){
      throw new ApiError(401,error?.message || "Ivalid refresh Token")
    }
})

const changeCurrentPassword = asyncHandler (async(req,res)=>{
  const {oldPassword,newPassword} = req.body
const user  = await User.findById(req.user?._id)
user.isPasswordCorrect = await user.
isPasswordCorrect(oldPassword)

if(!isPasswordCorrect){
  throw new ApiError(400,"Invalid Password")
}

user.password = newPassword
await user.save({validateBeforeSave: false})

return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(200,req.user,"current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname,email} = req.body
    if(!fullname || !email){
      throw new ApiError(400,"All fields are required")
    }
    const user = User.findByIdAndUpdate(req.user?._id,
      {
        $set:{
          fullname,
          email,

        }
      },
      {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully!"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Get user first (to access old avatar)
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Upload new avatar
  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);

  if (!uploadedAvatar?.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  // Delete old avatar from Cloudinary
  if (user.avatar) {
    const oldPublicId = getPublicIdFromUrl(user.avatar);
    await deleteFromCloudinary(oldPublicId);
  }

  // Update DB
  user.avatar = uploadedAvatar.url;
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar image updated successfully!"));
});


const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!coverImageLocalPath){
      throw new ApiError(400,"coverImage  file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
      throw new ApiError(400,"Error while uploading on coverImage")
    }
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          coverImage: avatar.url
        }
      },
      {new: true}
    )
    .select("-password")
    return res.status(200)
    .json(new Apiresponse(200,user,"cover image updated successfully!"))
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
// 1. destructuring user name
  const {username} = req.params
  // 2. check if username doesnt exist
  if(!username?.trim()){
    throw new ApiError(400, "username is missing")
  }
  // User.find({username}) 
  // INSTEAD OF THE METHOD DESCRIBED ABOVE WE WILL USE AGGREGATION PIPELINE
  const channel = await User.aggregate([
    {
      $match:{
        username: username?.toLowerCase()
      }
    },
    {
      $lookup:{
        from: "subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup:{
        from: "subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },{
      $addField:{
        subscribersCount:{
          $size: "subscribers"
        },
        channelsSubscribedToCount: {
          $size: "subscribedTo "
        },
        isSubscribed:{
          $condition:{
            if: {
              $in:[req.user?._id, "subscribers.subscriber"]
            },then:true
            ,else: false
          }
        }
      }
    },{
      $project:{
        fullName: 1,
        username: 1,
        subscribersCount : 1,
        channelsSubscribedToCount: 1,
        channelsSubscribedToCount: 1,
        avatar:1,
        coverImage: 1,
        email: 1
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(404, "channel does not exist")
  }

  return res.status(200).json(new ApiResponse(200,channel[0],"User channel fetched successfully"))

})

const getWatchHistory = asyncHandler(async(req,res)=>{
  const user = await User.aggregate([
    {
      $match: {
            _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project:{
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                } 
              ]
            }
          },{
            $addFields:{
              owner:{
                $first: "$owner" 
              }
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200).json(new ApiResponse(
    200,user[0].watchHistory,"Watch History fetched successfully!"
  ))
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
};
 