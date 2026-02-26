import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath)=>{
    try{
        if(!localFilePath) return null;
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        })
        // file has been uploaded successfully
        // console.log("File Uploaded on Cloudinary Successfully",response.url);
        console.log("Cloudinary Response:", response);
        fs.unlinkSync(localFilePath)
        
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload opn failed 
        return null;
    }
}

const deleteFromCloudinary = async(publicId)=>{
    try{
        if(!publicId) return null;
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    }catch(error){
        console.log("cloudinary delete error : ",error);
        return null;
    }
};

const getPublicIdFromUrl = (url)=>{
    try{
        if(!url) return null;

        const parts = url.split("/");
        const fileName = parts[parts.length-1];
        const publicId = fileName.split("."[0]);
        return publicId;
    } catch(error){
        return null;
    }
}
export {uploadOnCloudinary,
    deleteFromCloudinary,
    getPublicIdFromUrl
};