import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function IsBeforeCurrentDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isBeforeCurrentDate",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const currentDate = new Date();
          const dateValue = new Date(value);
          return dateValue < currentDate;
        },
        defaultMessage(args: ValidationArguments) {
          return "invalid_dob";
        },
      },
    });
  };
}

export function IsValidSchoolYear(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isValidSchoolYear",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const currentYear = new Date().getFullYear();
          return typeof value === "number" && value >= currentYear;
        },
        defaultMessage(args: ValidationArguments) {
          return "invalid_school_year";
        },
      },
    });
  };
}
