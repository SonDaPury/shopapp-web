import * as yup from "yup";
import { messages } from "../../utils/messages";

export const loginSchema = yup.object().shape({
  email: yup.string().email().required(messages.validation.users.emailRequired),
  password: yup.string().required(messages.validation.users.passwordRequired),
});

export const registerSchema = yup.object().shape({
  email: yup.string().email().required(messages.validation.users.emailRequired),
  role: yup.string().required(messages.validation.users.roleRequired),
  phoneNumber: yup
    .string()
    .nullable()
    .matches(
      /^(\+?\d{1,3})?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
      messages.validation.users.phoneNumberInvalid
    ),
});

export const verifyOptSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .nullable()
    .required(messages.validation.users.emailRequired),
  otp: yup.string().nullable().required(messages.validation.users.otpRequired),
});

export const refreshTokenSchema = yup.object().shape({
  refreshToken: yup
    .string()
    .nullable()
    .required(messages.validation.users.refreshTokenRequired),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .nullable()
    .required(messages.validation.users.emailRequired),
});

export const resetPasswordSchema = yup.object().shape({
  email: yup.string().email().required(messages.validation.users.emailRequired),
  otp: yup.string().required(messages.validation.users.otpRequired),
  newPassword: yup
    .string()
    .required(messages.validation.users.passwordRequired),
});
