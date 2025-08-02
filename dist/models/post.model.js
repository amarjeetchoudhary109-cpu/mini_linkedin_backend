"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostSchema = void 0;
const zod_1 = require("zod");
exports.createPostSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, { message: "Post content is required" }),
    imageUrl: zod_1.z.string().url().optional(),
});
