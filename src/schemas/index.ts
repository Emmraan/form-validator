import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).trim().nonempty(),
  email: z.string().email().trim().nonempty(),
  password: z.string().trim().nonempty(),
});

export const schemas = {
  signup: signupSchema,
};
