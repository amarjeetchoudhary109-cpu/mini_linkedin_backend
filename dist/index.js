"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const app_1 = require("./app");
dotenv_1.default.config();
(0, db_1.getPgVersion)()
    .then(() => {
    app_1.app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
    .catch((err) => {
    console.error("Failed to start the server:", err);
    process.exit(1);
});
