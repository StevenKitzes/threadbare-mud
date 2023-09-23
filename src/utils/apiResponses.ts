import { ApiResponse } from "@/types";

export const err401 = (customMessage?: string): ApiResponse => ({
  message: `Session invalid.${customMessage ? ` ${customMessage}` : ''}`,
  status: 401
});
export const err500 = (customMessage?: string): ApiResponse => ({
  message: `Server error.${customMessage ? ` ${customMessage}` : ''}`,
  status: 500
});
