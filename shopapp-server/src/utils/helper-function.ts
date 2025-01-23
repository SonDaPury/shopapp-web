import { UserRole } from "./constant";

export const isEnumValue = <T extends object>(
  enumObj: T,
  value: string
): boolean => {
  return Object.values(enumObj).includes(value as T[keyof T]);
};
