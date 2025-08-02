"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const token_1 = require("../utils/token");
exports.authMiddleware = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError_1.ApiError(401, "Authorization header is required");
    }
    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = (0, token_1.verifyAccessToken)(token);
        const existingUser = await prisma_1.default.user.findUnique({
            where: { id: decodedToken.userId },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
            },
        });
        if (!existingUser) {
            throw new ApiError_1.ApiError(401, "User not found");
        }
        req.user = existingUser;
        next();
    }
    catch (error) {
        return next(new ApiError_1.ApiError(401, "Invalid or expired access token"));
    }
});
