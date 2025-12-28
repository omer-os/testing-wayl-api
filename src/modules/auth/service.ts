import { Static } from "elysia";
import {
  authLoginBodySchema,
  authRegisterBodySchema,
  authUpdateProfileBodySchema,
} from "./schemas/req";
import db from "@/lib/db";
import ApiError from "@/lib/global-error";

export const authRegisterService = async (
  data: Static<typeof authRegisterBodySchema>
) => {
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ApiError("User already exists", 400);
  }

  const hashedPassword = await Bun.password.hash(data.password);

  const newUser = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      waylCustomerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    success: true as const,
    data: newUser,
    message: "User created successfully",
  };
};

export const authLoginService = async (
  data: Static<typeof authLoginBodySchema>
) => {
  const user = await db.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new ApiError("Invalid credentials", 401);
  }

  const isPasswordCorrect = await Bun.password.verify(
    data.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new ApiError("Invalid credentials", 401);
  }

  return user;
};

export const authGetCurrentUserService = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      waylCustomerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return {
    success: true as const,
    data: user,
    message: "User profile retrieved",
  };
};

export const authUpdateProfileService = async (
  userId: string,
  data: Static<typeof authUpdateProfileBodySchema>
) => {
  const updateData: { name?: string; email?: string } = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.email !== undefined) {
    // Check if email is already taken by another user
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ApiError("Email is already taken", 400);
    }

    updateData.email = data.email;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError("No fields to update", 400);
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      waylCustomerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    success: true as const,
    data: updatedUser,
    message: "Profile updated successfully",
  };
};

export const authLoginResponse = (
  accessToken: string,
  refreshToken: string
) => ({
  success: true as const,
  data: { accessToken, refreshToken },
  message: "Login successful",
});

export const authRefreshTokenResponse = (accessToken: string) => ({
  success: true as const,
  data: { accessToken },
  message: "Token refreshed",
});

export const authLogoutResponse = () => ({
  success: true as const,
  data: null,
  message: "Logged out successfully",
});
