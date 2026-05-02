export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  remember: boolean;
};

export type ForgotPasswordRequestInput = {
  phone: string;
};

export type ForgotPasswordVerifyInput = {
  phone: string;
  otp: string;
};

export type ForgotPasswordResetInput = {
  phone: string;
  resetToken: string;
  newPassword: string;
};

