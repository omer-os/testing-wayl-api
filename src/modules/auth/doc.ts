import { DocumentDecoration } from "elysia";

export const authRegisterDocs: DocumentDecoration = {
  summary: "Register user",
  description: "Register a new user account",
  operationId: "authRegister",
};

export const authLoginDocs: DocumentDecoration = {
  summary: "Login user",
  description: "Authenticate a user and receive access/refresh tokens",
  operationId: "authLogin",
};

export const authRefreshTokenDocs: DocumentDecoration = {
  summary: "Refresh access token",
  description: "Use refresh token to obtain a new access token",
  operationId: "authRefreshToken",
};

export const authGetProfileDocs: DocumentDecoration = {
  summary: "Get current user profile",
  description: "Retrieve the authenticated user's profile information",
  operationId: "authGetProfile",
};

export const authLogoutDocs: DocumentDecoration = {
  summary: "Logout user",
  description: "Clear authentication tokens and logout the user",
  operationId: "authLogout",
};

export const authUpdateProfileDocs: DocumentDecoration = {
  summary: "Update user profile",
  description:
    "Update the authenticated user's profile information (name and/or email)",
  operationId: "authUpdateProfile",
};
