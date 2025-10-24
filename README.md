# comment-system-backend-node-
Implementing a Comment System with MERN

## Table of Contents
- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [Structure](#structure)
-

---

## Project Setup

1. Clone the repository:
```bash
git clone https://github.com/Rana97Code/comment-system-backend-node.git
cd comment-system-backend-node

npm install
npm run dev

## Environment Variables

PORT=4000
MONGO_URI=mongodb+srv://ranabiswasoffice_db:rana24office@cluster1.e08bnjg.mongodb.net/
JWT_SECRET=my_super_secret_key_12345
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:3000

## structure 
src/
├── controllers/
│   ├── commentController.js
│   └── userController.js
├── dao/
│   └── userDao.js
├── models/
│   ├── Comment.js
│   ├── Content.js
│   └── User.js
├── routes/
│   ├── commentRoutes.js
│   └── userRoutes.js
├── services/
│   ├── commentService.js
│   └── userService.js
├── utils/
│   ├── populateReplies.js
│   ├── validators.js
│   └── validators.js
├── app.js
├── server.js
└── .env
