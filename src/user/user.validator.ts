import {
  MinLength,
  MaxLength,
  IsMobilePhone,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class UpdateParams {
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
}
export class EditPasswordParams {
  @MinLength(8)
  @MaxLength(32)
  old_password: string;

  @MinLength(8)
  @MaxLength(32)
  password: string;

  @MinLength(8)
  @MaxLength(32)
  're-password': string;
}
