import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';

export class CreateCategoryDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(30) name: string;
  @IsOptional() @IsString() description?: string;
}
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CreateUserDto {
  @IsString() @IsNotEmpty() name: string;
  @IsEmail() email: string;
}

export class CreateNoteDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() content: string;
  @IsInt() @Min(1) userId: number;
  @ValidateIf((_, value) => value !== undefined) @IsInt() @Min(1) categoryId?: number;
  @IsOptional() @IsBoolean() isPinned?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}
export class UpdateNoteDto {
  @IsOptional() @IsString() @IsNotEmpty() title?: string;
  @IsOptional() @IsString() @IsNotEmpty() content?: string;
  @ValidateIf((_, value) => value !== undefined) @IsInt() @Min(1) categoryId?: number;
  @IsOptional() @IsBoolean() isPinned?: boolean;
}
export class QueryNotesDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(20) limit = 5;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) categoryId?: number;
}
