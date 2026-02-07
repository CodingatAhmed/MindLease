import { IsString, IsNotEmpty, IsEnum, Matches } from 'class-validator';
import { UserRole } from '@mindlease/shared'; // Path to your separate enum file

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address' })
  address!: string;

  @IsString()
  @IsNotEmpty()
  signature!: string;

  @IsEnum(UserRole, { message: 'Role must be either creator or renter' })
  @IsNotEmpty()
  role!: UserRole; 
}