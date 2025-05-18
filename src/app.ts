import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { User } from "../types";
import { PermissionManager } from "./lib/pm/PermissionManaget";
import { authenticate } from "./middleware/authenticate";
import { authorize } from "./middleware/authorize";
import { createProduct } from "./productService";

declare global {
    namespace Express {
        interface Request {
            user?: User;
            pm?: PermissionManager;
        }
    }
}

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get(
    "/",
    authenticate,
    authorize({ role: "user", permissions: ["product:update"] }),
    (req: Request, res: Response) => {
        const { user, pm } = req || {};
        try {
            createProduct(
                {
                    name: "Test Product",
                    price: 10,
                },
                {
                    userId: req.user?.sub!,
                    pm: req.pm!,
                }
            );
        } catch {
            res.status(403).json({
                message: "Your don't have permission to create product",
            });
        }

        res.status(200).json({
            message: "Hello",
            user,
        });
    }
);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
