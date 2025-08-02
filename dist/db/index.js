"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPgVersion = getPgVersion;
const dotenv_1 = __importDefault(require("dotenv"));
const serverless_1 = require("@neondatabase/serverless");
dotenv_1.default.config();
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = (0, serverless_1.neon)(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require&channel_binding=require`);
async function getPgVersion() {
    try {
        const result = await sql `SELECT version()`;
        console.log("PostgreSQL Version:", result[0].version);
    }
    catch (error) {
        console.error("Error fetching PostgreSQL version:", error);
        process.exit(1);
    }
}
