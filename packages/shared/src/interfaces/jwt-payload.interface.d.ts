import { UserRole } from "../enums/roles.enum";
export interface JwtPayload {
    sub: string;
    walletAddress: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
