import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(20)
  displayName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}