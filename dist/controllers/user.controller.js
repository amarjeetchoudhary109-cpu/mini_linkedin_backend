"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserBio = exports.loginUser = exports.createUser = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const user_model_1 = require("../models/user.model");
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
const ApiResponse_1 = require("../utils/ApiResponse");
const token_1 = require("../utils/token");
exports.createUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = user_model_1.userRegisterSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: result.error.format(),
        });
    }
    const { name, email, bio, password, username } = result.data;
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError_1.ApiError(409, "User already exists");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    if (!hashedPassword) {
        throw new ApiError_1.ApiError(500, "Failed to hash password");
    }
    const newUser = await prisma_1.default.user.create({
        data: {
            name,
            email,
            bio,
            username: username.toLowerCase(),
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return res.status(201).json(new ApiResponse_1.ApiResponse(201, newUser, "User created successfully"));
});
exports.loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = user_model_1.loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: result.error.format(),
        });
    }
    const { email, password } = result.data;
    if (!email || !password) {
        throw new ApiError_1.ApiError(400, "Email and password are required");
    }
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError_1.ApiError(401, "Invalid password");
    }
    const accessToken = (0, token_1.generateAccessToken)(user.id);
    const refreshToken = (0, token_1.generateRefreshToken)(user.id);
    if (!accessToken || !refreshToken) {
        throw new ApiError_1.ApiError(500, "Failed to generate tokens");
    }
    await prisma_1.default.user.update({
        where: {
            id: user.id
        },
        data: {
            refreshToken
        }
    });
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 40 * 60 * 1000,
    });
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio
        },
        accessToken,
        refreshToken
    }, "Login successful"));
});
exports.updateUserBio = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { bio } = req.body;
    if (!userId) {
        throw new ApiError_1.ApiError(401, "User not authenticated");
    }
    if (!bio || bio.trim().length === 0) {
        throw new ApiError_1.ApiError(400, "Bio is required");
    }
    if (bio.length > 500) {
        throw new ApiError_1.ApiError(400, "Bio must be less than 500 characters");
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: { bio: bio.trim() },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, updatedUser, "Bio updated successfully"));
});
