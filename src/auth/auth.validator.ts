import {
  MinLength,
  MaxLength,
  IsMobilePhone,
  IsOptional,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class RegisterParams {
  @MinLength(8)
  @MaxLength(32)
  username: string;

  @MinLength(8)
  @MaxLength(32)
  password: string;

  @MinLength(8)
  @MaxLength(32)
  're-password': string;

  @IsMobilePhone()
  @IsOptional()
  tel: string;

  @MinLength(2)
  @MaxLength(16)
  @IsOptional()
  name: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsUrl()
  @IsOptional()
  avatar: string;
}
