import { IsEmail, IsString, IsNotEmpty, MinLength, IsNumber, Length, Matches } from "class-validator";
import { Type } from "class-transformer";
import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export function MatchField(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "matchField",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}

export class LoginDto {
  @IsEmail({}, { message: "Please provide a valid email" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  password!: string;
}

// DTO for OTP verification
export class VerifyOtpDto {
  @IsNumber({}, { message: "User ID is required" })
  @Type(() => Number)
  userId!: number;

  @IsString()
  @IsNotEmpty({ message: "OTP ID is required" })
  otpId!: string;

  @IsString()
  @Length(6, 6, { message: "Valid OTP is required" })
  otp!: string;
}

export class RequestOtpDto {
  @IsEmail({}, { message: "Valid email is required" })
  email!: string;
}

export class SetPasswordDto {
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: "Password confirmation is required" })
  @MatchField("password", { message: "Password confirmation does not match password" })
  confirmPassword!: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: "Valid email is required" })
  email!: string;
}

export class VerifyResetTokenDto {
  @IsString()
  @IsNotEmpty({ message: "Token is required" })
  token!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: "Token is required" })
  token!: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: "Password confirmation is required" })
  @MatchField("password", { message: "Password confirmation does not match password" })
  confirmPassword!: string;
}
