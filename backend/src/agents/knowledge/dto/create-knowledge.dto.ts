import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateKnowledgeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content!: string;
}