import { jwtValidationResponse, validateToken } from "@kinde/jwt-validator";
import { NextFunction, Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import { User } from "../../types";
import { PermissionManager } from "../lib/pm/PermissionManaget";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    const validationResult: jwtValidationResponse = await validateToken({
        token,
        domain: process.env.KINDE_DOMAIN,
    });

    if (validationResult.valid) {
        const user = jwtDecode<User>(token);

        console.log("to the user", user);

        const pm = new PermissionManager({
            roles: user["x-hasura-roles"].map((role) => role.key),
            permissions: user["x-hasura-permissions"],
        });

        req.user = user;
        req.pm = pm;

        next();
        return;
    }

    res.status(401).json({
        message: "Unauthorized",
    });
};
