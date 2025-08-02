"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
// Ensure only one instance of PrismaClient is used (especially in dev mode)
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: ['query', 'info', 'warn', 'error'], // Optional logging
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
exports.default = exports.prisma;
