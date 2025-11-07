# 🎬 ChillCast - Watch Together, Vibe Together

<div align="center">

![ChillCast Banner](https://img.shields.io/badge/ChillCast-Watch%20Together-8b5cf6?style=for-the-badge&logo=youtube&logoColor=white)

**A real-time watch party application that brings people together through synchronized video playback, screen sharing, and interactive chat.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🎥 **Synchronized Playback**
- Host-controlled YouTube video playback
- Perfect synchronization across all participants
- Play, pause, and seek controls for hosts

### 🔒 **Private Rooms**
- Secure rooms with unique IDs and passwords
- Host and guest role management
- Room code sharing for easy access

### 🖥️ **Screen Sharing**
- Share your screen with audio support
- WebRTC-powered peer-to-peer connections
- Show anything beyond YouTube videos

### 💬 **Real-time Chat**
- Public room chat for everyone
- Private messaging between members
- Emoji support for expressive communication
- Live typing indicators

### 👥 **Live Members List**
- See who's in your room in real-time
- Online/offline status indicators
- Quick access to private chat

### ⚡ **No Login Required**
- Jump right in without creating an account
- Simple nickname-based identification
- Privacy-focused design

### 🎨 **Beautiful UI**
- Stunning galaxy-themed dark interface
- Glass morphism design elements
- Smooth animations and transitions
- Fully responsive across all devices

---

## 🚀 Demo

Experience ChillCast live: [Your Deployment URL]

### Screenshots

*Coming soon - Add your screenshots here*

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/chillandcast.git
cd chillandcast
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** You'll need to set up a Supabase project and configure the database tables for real-time features.

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:8080`

---

## 📖 Usage

### Creating a Room

1. Click **"Create Room"** on the homepage
2. Enter your nickname
3. Set a room password (optional)
4. Share the room code with friends

### Joining a Room

1. Click **"Join Room"** on the homepage
2. Enter the room code
3. Provide the password (if required)
4. Enter your nickname and join

### Host Controls

- **Play/Pause**: Control video playback for everyone
- **Seek**: Jump to any point in the video
- **Screen Share**: Share your screen with audio
- **Manage Members**: View and interact with participants

### Guest Features

- **Watch**: Synchronized viewing experience
- **Chat**: Participate in room discussions
- **Private Messages**: Chat one-on-one with other members
- **Screen View**: Watch host's screen share

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **Framer Motion** - Animation library

### Backend & Real-time
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication (optional)

### Media & Communication
- **react-youtube** - YouTube player integration
- **WebRTC** - Peer-to-peer screen sharing
- **bcryptjs** - Password hashing

### State Management & Routing
- **React Router** - Client-side routing
- **TanStack Query** - Server state management

---

## 📁 Project Structure

```
chillandcast/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── room/       # Room-specific components
│   │   └── ui/         # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # Third-party integrations
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── App.tsx         # Main app component
│   ├── index.css       # Global styles
│   └── main.tsx        # Entry point
├── index.html          # HTML template
├── package.json        # Dependencies
├── tailwind.config.ts  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Code Quality

This project uses:
- **ESLint** for code linting
- **TypeScript** for type checking
- **Prettier** for code formatting (recommended)

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/chillandcast)

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/chillandcast)

### Other Platforms

ChillCast can be deployed to any static hosting service:
- **GitHub Pages**
- **Firebase Hosting**
- **Cloudflare Pages**
- **AWS S3 + CloudFront**

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 🐛 Known Issues

- Screen sharing may not work on some mobile browsers
- Large rooms (50+ users) may experience performance issues
- Safari users may need to enable WebRTC features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Arpit Singh**

- Instagram: [@arpit.singh006](https://www.instagram.com/arpit.singh006)
- LinkedIn: [Arpit Singh](https://www.linkedin.com/in/arpit-singh-07888b38b)
- Email: mail.arpit0110@gmail.com

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the real-time backend
- [Lucide Icons](https://lucide.dev/) for the icon set
- All contributors and users of ChillCast

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/chillandcast?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/chillandcast?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/chillandcast)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/chillandcast)

---

<div align="center">

**Made with ❤️ by Arpit Singh**

⭐ Star this repo if you find it helpful!

</div>
