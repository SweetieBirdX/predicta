# Predicta - Decentralized Prediction Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2.30-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Firebase-11.10.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Privy-2.17.3-6366F1?style=for-the-badge&logo=privy&logoColor=white" alt="Privy">
  <img src="https://img.shields.io/badge/Tailwind-3.3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Wagmi-2.15.6-1C1C1C?style=for-the-badge&logo=wagmi&logoColor=white" alt="Wagmi">
</div>

## 🚀 About the Project

Predicta is a decentralized prediction platform where users can create predictions on various topics and vote on them. The project combines Web3 technologies with traditional web experience to provide a modern user interface.

### ✨ Key Features

- **🔐 Multi-Authentication**: Login with wallet, email, Google, Twitter via Privy
- **📊 Prediction System**: Users can make YES/NO predictions
- **🎯 XP System**: Voting rewards (+5 XP) and correct prediction bonuses (+10 XP)
- **🏆 Leaderboard**: Real-time XP ranking updates
- **👤 Profile System**: Detailed statistics and badge system
- **⚡ Real-time Updates**: Automatic data refresh
- **🔮 Auto-resolution**: Automatic resolution when time expires
- **👨‍💼 Admin Panel**: Manual prediction result determination

### 🎨 Modern UI/UX

- **Aurora Background**: Animated gradient effects
- **Glassmorphism**: Modern glass-effect cards
- **Responsive Design**: Compatible with all devices
- **Loading States**: Smooth user experience
- **Hover Animations**: Interactive element animations

## 🛠️ Tech Stack

### Frontend
- **Next.js 14.2.30**: Modern React framework with App Router
- **TypeScript 5.0**: Type-safe development
- **Tailwind CSS 3.3.0**: Utility-first CSS framework
- **React 18**: Modern React hooks and context API

### Backend & Database
- **Firebase 11.10.0**: Firestore NoSQL database
- **Firebase Functions**: Server-side operations
- **Real-time Updates**: Live data synchronization

### Web3 & Authentication
- **Privy 2.17.3**: Multi-authentication provider
- **Wagmi 2.15.6**: Ethereum wallet integration
- **Viem 2.31.7**: Ethereum utilities

## 📦 Installation

### Requirements

- Node.js 16.8 or higher
- npm or yarn
- Firebase project
- Privy account

### 1. Clone the Project

```bash
git clone https://github.com/yourusername/predicta-eth-cannes.git
cd predicta-eth-cannes
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Environment Variables

Create a `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

### 4. Firebase Setup

For detailed Firebase setup guide, check the [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md) file.

### 5. Privy Setup

1. Create a new project on [Privy Dashboard](https://dashboard.privy.io/)
2. Add your App ID to the `.env.local` file
3. Configure your callback URLs (`http://localhost:3000`)

### 6. Run the Project

```bash
npm run dev
```

The application will start running at `http://localhost:3000`.

## 🗄️ Database Structure

### Collections

#### `users`
```typescript
{
  id: string;
  privyId: string;
  walletAddress?: string;
  email?: string;
  createdAt: Date;
  xp: number;
  correctPredictions: number;
  totalPredictions: number;
  badges: string[];
}
```

#### `predictions`
```typescript
{
  id: string;
  creatorId: string;
  question: string;
  description: string;
  endDate: Date;
  status: 'active' | 'resolved';
  result: 'yes' | 'no' | null;
  correctAnswer: 'yes' | 'no' | null;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  createdAt: Date;
}
```

#### `votes`
```typescript
{
  id: string;
  userId: string;
  predictionId: string;
  choice: 'yes' | 'no';
  createdAt: Date;
}
```

## 🎯 Usage Scenarios

### 1. Creating Predictions

```typescript
// User creates a new prediction
const prediction = await createPrediction({
  creatorId: 'user123',
  question: 'Will Bitcoin reach $100,000 by the end of 2024?',
  description: 'Do you think Bitcoin will exceed $100,000 by the end of this year?',
  endDate: new Date('2024-12-31'),
  status: 'active',
  result: null,
  correctAnswer: null // Only admin determines
});
```

### 2. Voting

```typescript
// User votes on a prediction
const vote = await createVote({
  userId: 'user123',
  predictionId: 'prediction456',
  choice: 'yes'
});
// User gains +5 XP
```

### 3. Resolution

```typescript
// Admin determines prediction result
await resolvePrediction('prediction456', 'yes');
// Users with correct predictions get +10 XP bonus
```

## 🏆 XP and Badge System

### Ways to Earn XP
- **Voting**: +5 XP
- **Correct prediction**: +10 XP bonus
- **Creating predictions**: System activity

### Badge Categories
- **Novice Predictor**: First 5 predictions
- **Active Voter**: 10+ votes
- **Prediction Master**: 50+ correct predictions
- **Oracle**: 100+ correct predictions
- **Crypto Expert**: Success in crypto predictions
- **Tech Guru**: Success in technology predictions

### Level System
```typescript
// Level calculation based on XP
const level = calculateUserLevel(xp);
// Each level requires 100 XP
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build the project
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## 🚀 Deployment

### Vercel Deployment

1. Connect your Vercel account with GitHub
2. Import the project
3. Set up environment variables
4. Deploy

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Build the project
npm run build

# Deploy to Firebase
firebase deploy
```

## 📊 Real-time Update System

The application automatically updates at the following intervals:
- **Leaderboard**: Every 10 seconds
- **Predictions**: Every 15 seconds
- **Auto-resolution**: When time expires

## 🔐 Security

- Secure authentication with Privy
- Firebase Security Rules
- XSS protection
- CSRF protection
- Rate limiting

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Privy](https://privy.io/) - Web3 authentication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Wagmi](https://wagmi.sh/) - Ethereum utilities
