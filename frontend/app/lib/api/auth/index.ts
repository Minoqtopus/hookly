// Auth API barrel exports
export * from './register';
export * from './login';
export * from './refresh';
export * from './logout';
export * from './google';
export * from './verification';
export * from './password-reset';

// Consolidated auth API object for convenience
import { registerAPI } from './register';
import { loginAPI } from './login';
import { refreshAPI } from './refresh';
import { logoutAPI } from './logout';
import { googleAPI } from './google';
import { verificationAPI } from './verification';
import { passwordResetAPI } from './password-reset';

export const authAPI = {
  ...registerAPI,
  ...loginAPI,
  ...refreshAPI,
  ...logoutAPI,
  ...googleAPI,
  ...verificationAPI,
  ...passwordResetAPI,
};