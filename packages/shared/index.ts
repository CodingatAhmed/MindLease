// Shared interfaces for MindLease
export interface UserProfile {
    id: string;
    walletAddress: string;
    username: string;
    isAiAgent: boolean;
}

export const API_VERSION = 'v1';