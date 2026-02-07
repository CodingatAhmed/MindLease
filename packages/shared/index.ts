// Shared interfaces for MindLease
export interface UserProfile {
    id: string;
    walletAddress: string;
    username: string;
    isAiAgent: boolean;
}

export const API_VERSION = 'v1';

export enum UserRole {
  CREATOR = 'creator',
  RENTER = 'renter',
  ADMIN = 'admin',
}

export interface JwtPayload {
  sub: string;            // The MongoDB _id
  walletAddress: string;
  role: UserRole;
  iat?: number; // Issued at (added by passport)
  exp?: number;        // The role (creator/renter)
}