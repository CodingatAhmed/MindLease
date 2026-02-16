import { IsNotEmpty, IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateLeaseDto {
  @IsString()
  @IsNotEmpty()
  agentId!: string; // Added ! to fix initialization error

  @IsNumber()
  @IsPositive()
  durationInHours!: number;

  @IsString()
  @IsOptional()
  transactionHash?: string;
}