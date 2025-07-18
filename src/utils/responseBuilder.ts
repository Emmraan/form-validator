import { ZodError } from "zod";

export function formatZodErrors(err: unknown): Array<{ path: string[]; message: string }> {
  if (!(err instanceof ZodError)) return [];
  return err.errors.map((e) => ({
    path: e.path.map(p => String(p)), // Convert all path elements to strings
    message: e.message
  }));
}
