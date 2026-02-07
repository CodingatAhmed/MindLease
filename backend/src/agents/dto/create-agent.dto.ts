import { IsString, IsNumber, IsArray, IsEnum, MinLength, IsNotEmpty, Min } from 'class-validator';
import { UserRole } from '@mindlease/shared';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsArray()
  @IsString({ each: true })
  capabilities: string[];

  // This ensures the frontend doesn't accidentally try to assign
  // an agent to a role that doesn't exist in our shared package
  @IsEnum(UserRole)
  ownerRole: UserRole;
}