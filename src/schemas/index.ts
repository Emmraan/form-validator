import { z } from "zod";

export const signupSchema = z.object({
  firstname: z.string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'.-]+$/, "First name can only contain letters, spaces, hyphens, apostrophes, and periods"),
  lastname: z.string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'.-]+$/, "Last name can only contain letters, spaces, hyphens, apostrophes, and periods"),
  email: z.string()
    .trim()
    .email("Please enter a valid email address"),
  password: z.string()
    .trim()
    .min(1, "Password is required"),
});

export const schemas = {
  signup: signupSchema,
};
