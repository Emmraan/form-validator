import { ZodError } from "zod";

export function formatZodErrors(err: unknown): Array<{ path: string[]; message: string }> {
  if (!(err instanceof ZodError)) return [];
  return err.errors.map((e) => ({
    path: e.path.map(p => String(p)),
    message: e.message
  }));
}

export function buildErrorResponse(code: string, message: string) {
  return {
    success: false,
    errors: [{
      path: [code],
      message: message
    }]
  };
}
