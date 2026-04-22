export type Role = 'parent' | 'kid';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface KidProfile extends User {
  role: 'kid';
  points: number;
  lifetimePoints: number; // Used for calculating levels
  level: number;
  streak: number;
  avatar: string;
}

export interface ParentProfile extends User {
  role: 'parent';
  avatar?: string;
  pin?: string;
}

export type TaskFrequency = 'daily' | 'weekly' | 'once';
export type TaskStatus = 'pending' | 'completed_pending_approval' | 'approved' | 'rejected' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  frequency: TaskFrequency;
  assignedTo: string[]; // Array of kid IDs
  icon?: string;
  createdAt: string; // ISO date string
  timesPerDay?: number;
}

export interface TaskInstance {
  id: string;
  taskId: string;
  childId: string;
  status: TaskStatus;
  date: string; // ISO date string
  completionTimestamp?: string; // ISO date string
  approvedBy?: string; // Parent's User ID
  completedCountToday?: number;
  lastResetLogicalDay?: string;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon?: string;
}

export interface RewardClaim {
  id: string;
  rewardId: string;
  kidId: string;
  status: 'pending' | 'delivered';
  claimedAt: string;
  deliveredAt?: string;
  kidAcknowledged?: boolean;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  title: string;
  description: string;
  points: number;
  icon?: string;
  kidId: string;
  approvedBy: string; // Parent's User ID
  completedAt: string; // ISO date string
}

// Mock Data Store Type (for the prototype phase)
export interface AppData {
  users: (KidProfile | ParentProfile)[];
  tasks: Task[];
  rewards: Reward[];
  rewardClaims: RewardClaim[];
  taskHistory?: TaskHistory[];
}

