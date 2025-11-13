# MadeInIndia - Social Media Platform 🇮🇳

A modern, full-stack social media application built specifically for Indian users to connect, share moments, and celebrate culture together.

![MadeInIndia App](https://via.placeholder.com/800x400/4f46e5/ffffff?text=MadeInIndia+Screenshot)

## 🚀 Features

### 🌟 Core Features
- **User Authentication** - Secure signup/login with JWT
- **Social Feed** - Personalized feed with posts from followed users
- **Media Sharing** - Upload images and videos with captions
- **Explore** - Discover new content and users
- **User Profiles** - Customizable profiles with bio and avatar
- **Real-time Interactions** - Like, comment, and share posts
- **Follow System** - Follow/unfollow other users

### 🎨 User Experience
- **Dark/Light Mode** - Toggle between themes
- **Mobile Responsive** - Works seamlessly on all devices
- **Modern UI** - Built with Tailwind CSS and smooth animations
- **Accessibility** - High contrast and reduced motion options

### ⚙️ Advanced Features
- **Notification System** - Customizable notification preferences
- **Privacy Settings** - Control profile visibility and messaging
- **User Settings** - Comprehensive settings management
- **Search & Discovery** - Find users and content easily

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **bcrypt** - Password hashing

### Development
- **Environment Variables** - Configuration management
- **CORS** - Cross-origin resource sharing
- **RESTful API** - Clean API design

## 📸 Screenshots

### Home Page
<img width="1373" height="676" alt="Screenshot 2025-11-13 at 22 22 36" src="https://github.com/user-attachments/assets/00770e62-8f6e-4024-ab97-d63c3c6d65a8" />
*Beautiful landing page with featured content and call-to-action*

### User Login
<img width="1373" height="676" alt="Screenshot 2025-11-13 at 22 22 47" src="https://github.com/user-attachments/assets/85a8c27f-8934-4824-abf3-6dec864668cd" />
*Personalized feed with posts, likes, and comments*

### User Registration
<img width="1373" height="676" alt="Screenshot 2025-11-13 at 22 22 54" src="https://github.com/user-attachments/assets/dbb3fc71-7ce6-4748-aa8e-d793faa0c212" />
*With minimalist UI and Easy way to get register.*

### User Profile
<img width="1373" height="676" alt="Screenshot 2025-11-13 at 22 23 25" src="https://github.com/user-attachments/assets/a647052b-b537-4836-986c-77a2a5e7c490" />
*User profile with posts, followers, and editing options*

### Explore
<img width="1373" height="676" alt="Screenshot 2025-11-13 at 22 23 20" src="https://github.com/user-attachments/assets/01e23eec-00ac-4d01-a0f9-43a26e177150" />
*Discover new content and users*

### Settings
<img width="1373" height="676" alt="Screenshot 2025-11-13 at 22 23 30" src="https://github.com/user-attachments/assets/1ad3beec-4c09-4e59-a05b-0900167b34d1" />
*Comprehensive settings with dark mode toggle*

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bamaniyamilan/madeinindia-social.git
   cd madeinindia-social
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend .env
   MONGODB_URI=mongodb://localhost:27017/madeinindia
   JWT_SECRET=your_jwt_secret_here
   PORT=4000

   # Frontend .env
   REACT_APP_API_URL=http://localhost:4000/api
   ```

4. **Run the application**
   ```bash
   # Start backend (from backend directory)
   npm run dev

   # Start frontend (from client directory)
   npm start
   ```

5. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## 📁 Project Structure

```
madeinindia-social/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   └── config/         # Database configuration
├── client/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── features/   # Redux slices
│   │   ├── utils/      # Helper functions
│   │   └── styles/     # CSS and Tailwind
│   └── public/         # Static assets
└── uploads/            # User uploaded files
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/` - Update user profile
- `POST /api/users/:username/follow` - Follow user
- `POST /api/users/:username/unfollow` - Unfollow user

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get user feed
- `GET /api/posts/explore` - Explore posts
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment

## 🎯 Key Features Explained

### Real-time Feed
- Personalized content based on followed users
- Infinite scrolling for better UX
- Optimistic updates for instant feedback

### Media Management
- Support for multiple image/video uploads
- Local file storage with Multer
- Responsive media galleries

### User Experience
- Dark mode with persistent preferences
- Mobile-first responsive design
- Smooth animations and transitions

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ in India
- Icons from Heroicons
- Font: Work Sans
- UI Inspiration from modern social platforms

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check our [FAQ](FAQ.md)
- Contact the development team

---

**Made with pride in India** 🇮🇳

*Connect, Share, Celebrate - Together we build community!*
