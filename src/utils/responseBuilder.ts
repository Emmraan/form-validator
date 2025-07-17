import { ZodError } from "zod";

export function formatZodErrors(err: unknown) {
  if (!(err instanceof ZodError)) return [];
  return err.errors.map((e) => ({ path: e.path, message: e.message }));
}
