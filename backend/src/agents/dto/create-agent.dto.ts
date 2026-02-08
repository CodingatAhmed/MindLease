import { IsString, IsNumber, IsArray, MinLength, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description!: string;

  @IsString()
  @IsNotEmpty()
  category!: string; // Added: Critical for marketplace filtering

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional() // Made optional so creators aren't forced to add them immediately
  capabilities?: string[];
}