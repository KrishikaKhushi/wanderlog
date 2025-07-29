# WanderLog 🌍

A comprehensive travel planning application that helps users organize their trips, discover destinations, and create memorable itineraries.

## 📁 Project Structure

```
WanderLog/
├── backend/          # Node.js/Express backend API
├── frontend/         # React frontend application  
├── node_modules/     # Dependencies
├── .gitignore       # Git ignore rules
├── package.json     # Root dependencies
└── package-lock.json # Dependency lock file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KrishikaKhushi/wanderlog.git
cd wanderlog
```

2. **Install root dependencies** (if any)
```bash
npm install
```

3. **Setup Backend**
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:5000` (or your configured port)

4. **Setup Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:3000` (or your configured port)

## 🛠️ Technologies Used

### Frontend
- **React.js** - User interface library
- **Vite** - Build tool and development server
- **CSS3** - Styling
- **JavaScript (ES6+)** - Programming language

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **[Add your database]** - Database (MongoDB/PostgreSQL/MySQL)
- **[Add other backend tools]** - Authentication, APIs, etc.

## 📝 Features

- 🗺️ Interactive trip planning
- 📍 Destination discovery
- 📅 Itinerary management
- 💾 Save and organize trips
- 🔍 Search functionality
- 📱 Responsive design
- Social Media layout
- Design to connect and explore

## 🔧 Configuration

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend (.env)**
```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
VITE_API_KEY=your_frontend_api_key
```

## 📷 Screenshots

<!-- Add screenshots of your application -->
![WanderLog Dashboard](screenshots/dashboard.png)
![Trip Planning](screenshots/trip-planning.png)

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
```bash
cd frontend
npm run build
# Upload dist folder to your hosting platform
```

### Backend Deployment (Heroku/Railway/Render)
```bash
cd backend
# Follow your hosting platform's deployment guide
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Krishika Khushi**
- GitHub: [@KrishikaKhushi](https://github.com/KrishikaKhushi)
- LinkedIn: www.linkedin.com/in/krishikakhushi

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspiration from travel planning needs

## 📞 Support

If you have any questions or need help, please open an issue or contact me directly.

---

⭐ Don't forget to give this project a star if you found it helpful!