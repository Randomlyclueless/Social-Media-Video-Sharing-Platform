# Trizo — Social Media Video Sharing Platform

## Overview
Trizo is a full-stack MERN social media video sharing platform where users can upload, manage, and interact with short videos. The platform supports secure authentication, creator channels, subscriptions, and cloud-based media storage.  
It demonstrates real-world full-stack architecture including REST APIs, media handling, and deployment.

---

## Demo

[![Trizo Demo](https://img.youtube.com/vi/p9kk3I38U8U/0.jpg)](https://youtu.be/p9kk3I38U8U)

---

## Features

### User Authentication
Secure user registration and login using JSON Web Tokens (JWT) stored in HTTP-only cookies. Protected routes ensure only authenticated users can access personal data and creator functionality.

### User Profiles & Channels
Each user has a personal channel displaying avatar, profile information, and uploaded videos. Users can update profile details and manage their channel content.

### Video Upload & Management
Authenticated users can upload videos with title, description, and thumbnail. Files are processed using Multer and stored on Cloudinary. Video metadata is stored in MongoDB.

### Video Playback System
Users can watch videos through a dedicated player interface showing video details, creator info, and engagement context. Videos stream directly from Cloudinary CDN.

### Subscribe / Unsubscribe System
Users can subscribe to creator channels. The system maintains subscriber relationships using a dedicated Subscription model and displays subscriber counts and subscription status.

### Comments & Interaction
Users can post comments on videos to enable discussion and interaction. Comments are linked to both the video and the user.

### Creator Dashboard
Creators can view and manage their uploaded videos and channel content through a dashboard interface.

### Cloud Media Storage
All video and image assets are stored in Cloudinary, enabling scalable storage and fast global delivery without increasing backend server load.

### MongoDB Data Modeling
The backend uses structured schemas for users, videos, subscriptions, and comments. Relationships are maintained via ObjectId references to support scalable social features.

### RESTful API Architecture
The backend exposes modular REST endpoints organized by resource (users, videos, comments, subscriptions). Controllers manage logic while routes define endpoints.

### Deployment Architecture
The backend is configured for cloud deployment using environment variables, MongoDB Atlas database, and Cloudinary media storage. The service is deployed on Render.

---

## Tech Stack

**Frontend:** React (Vite), CSS  
**Backend:** Node.js, Express  
**Database:** MongoDB Atlas  
**Media Storage:** Cloudinary  
**Authentication:** JWT + Cookies  
**Deployment:** Render  

---

## Project Structure

```
trizo/
  backend/
    src/
      controllers/
      models/
      routes/
      middlewares/
      utils/
      db/
      app.js
      index.js
  frontend/
    src/
      pages/
      components/
      context/
      api/
```

---

## Installation

### Backend
```
cd backend
npm install
npm run dev
```

### Frontend
```
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Backend requires:

```
MONGO_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CORS_ORIGIN=
```

---

## API Base URL

```
https://social-media-video-sharing-platform.onrender.com/api/v1
```

---

## Deployment Status

Backend deployed on Render  
MongoDB hosted on MongoDB Atlas  
Cloudinary used for media storage  
Frontend deployment in progress  

---

## Author

Kimaya Chavan  
MERN Stack Developer
