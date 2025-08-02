"use strict";
/// <reference path="../types/express.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPostByUsername = exports.deletePost = exports.getAllPosts = exports.createPost = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const post_model_1 = require("../models/post.model");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const cloudinary_1 = require("../utils/cloudinary");
exports.createPost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = post_model_1.createPostSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: result.error.issues,
        });
    }
    let { content, imageUrl } = result.data;
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError_1.ApiError(401, "User not authenticated");
    }
    if (!content) {
        throw new ApiError_1.ApiError(400, "Content is required");
    }
    if (req.file?.path) {
        const cloudinaryResult = await (0, cloudinary_1.uploadOnCloudinary)(req.file?.path, "posts");
        if (cloudinaryResult?.secure_url) {
            imageUrl = cloudinaryResult.secure_url;
        }
    }
    if (!imageUrl) {
        throw new ApiError_1.ApiError(400, "Image is required");
    }
    const post = await prisma_1.default.post.create({
        data: {
            content,
            imageUrl,
            authorId: userId,
        },
        include: {
            author: {
                select: { id: true, name: true, username: true }
            }
        }
    });
    return res.status(201).json(new ApiResponse_1.ApiResponse(201, post, "Post created successfully"));
});
exports.getAllPosts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.query;
    const whereClause = userId ? { authorId: userId } : {};
    const posts = await prisma_1.default.post.findMany({
        where: whereClause,
        include: {
            author: {
                select: { id: true, name: true, username: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, posts, "Posts fetched successfully"));
});
exports.deletePost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const postId = req.params.id;
    const userId = req.user?.id;
    const post = await prisma_1.default.post.findUnique({
        where: { id: postId },
    });
    if (!post)
        throw new ApiError_1.ApiError(404, "Post not found");
    if (post.authorId !== req.user.id) {
        throw new ApiError_1.ApiError(403, "You are not authorized to delete this post");
    }
    await prisma_1.default.post.delete({
        where: { id: postId },
    });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "Post deleted successfully"));
});
exports.getUserPostByUsername = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { username } = req.params;
    const user = await prisma_1.default.user.findFirst({
        where: { username: username.toLowerCase() },
        select: {
            id: true,
            name: true,
            username: true,
            bio: true
        }
    });
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    const posts = await prisma_1.default.post.findMany({
        where: { authorId: user.id },
        include: {
            author: {
                select: { id: true, name: true, username: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, { user, posts }, "User posts fetched successfully"));
});
