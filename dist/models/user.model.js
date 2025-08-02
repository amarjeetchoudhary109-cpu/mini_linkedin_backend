"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bioSchema = exports.loginSchema = exports.userRegisterSchema = void 0;
const zod_1 = require("zod");
exports.userRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be more than 4 letter long"),
    username: zod_1.z.string().min(4, "Username must be more than 4 letter long").toLowerCase(),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be more than 6 letter long").max(20, "Password must be less than 20 letter long"),
    bio: zod_1.z.string().min(10, "Bio must be more than 10 letter long").max(100, "Bio must be less than 100 letter long")
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z.string().min(6, "Password must be more than 6 letter long").max(20, "Password must be less than 20 letter long")
});
exports.bioSchema = zod_1.z.object({
    bio: zod_1.z.string().max(300, "Bio must be 300 characters or less"),
});
