// User type
export interface Badge {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  xpRequired: number;
  type: 'welcome' | 'xp' | 'activity' | 'achievement';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface User {
  id: string;
  privyId?: string;
  walletAddress?: string;
  email?: string;
  xp: number;
  correctPredictions: number;
  totalPredictions: number;
  badges: Badge[];
  createdAt: Date;
}

// Prediction type
export interface Prediction {
  id: string;
  creatorId: string;
  question: string;
  description?: string;
  endDate: Date;
  status: 'active' | 'resolved' | 'expired';
  result?: 'yes' | 'no' | null;
  correctAnswer?: 'yes' | 'no' | null;
  totalVotes?: number;
  yesVotes?: number;
  noVotes?: number;
}

// Vote type
export interface Vote {
  id: string;
  userId: string;
  predictionId: string;
  choice: 'yes' | 'no';
  timestamp: Date;
}

// Leaderboard entry type
export interface LeaderboardEntry {
  userId: string;
  xp: number;
  correctPredictions: number;
  totalPredictions: number;
  successRate: number;
  lastUpdated: Date;
}

// Badge System Types
export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: Date;
  isNew: boolean; // Newly earned (for popup)
}

export interface BadgeProgress {
  userId: string;
  currentXP: number;
  nextBadge: Badge | null;
  progressPercentage: number;
}

// Predefined Badge Definitions
export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'welcome',
    name: 'Welcome!',
    description: 'Welcome to the platform for the first time! You\'ve stepped into the world of predictions.',
    imagePath: '/welcome-badge.svg',
    xpRequired: 0,
    type: 'welcome',
    rarity: 'common'
  },
  {
    id: 'great_start',
    name: 'Great Start',
    description: 'You\'re doing great. Keep it up!',
    imagePath: '/badge2.svg',
    xpRequired: 50,
    type: 'xp',
    rarity: 'rare'
  },
  {
    id: 'pushing_harder',
    name: 'Pushing Harder',
    description: 'You\'re pushing harder. Let\'s reach 500XP!',
    imagePath: '/badge3.svg',
    xpRequired: 100,
    type: 'xp',
    rarity: 'epic'
  },
  {
    id: 'nirvana',
    name: 'Nirvana',
    description: 'You\'ve reached the Nirvana level! You\'re a prediction master.',
    imagePath: '/badge4.svg',
    xpRequired: 500,
    type: 'xp',
    rarity: 'legendary'
  }
]; 