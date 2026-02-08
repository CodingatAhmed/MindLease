import { UserRole } from "../enums/roles.enum";
export interface JwtPayload {
  sub: string;            // The MongoDB _id
  walletAddress: string;
  role: UserRole;
  iat?: number; // Issued at (added by passport)
  exp?: number;        // The role (creator/renter)
}