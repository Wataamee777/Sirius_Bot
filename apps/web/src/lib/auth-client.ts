import { createAuthClient } from "better-auth/react";
import { BASE_URL } from "./constants";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || BASE_URL,
});
