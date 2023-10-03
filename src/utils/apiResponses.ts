import { ApiResponse } from "@/types";

export const err400 = (customMessage?: string): ApiResponse => ({
  message: `Input not accepted.${customMessage ? ` ${customMessage}` : ''}`,
  status: 400
});
export const err401 = (customMessage?: string): ApiResponse => ({
  message: `Session invalid.${customMessage ? ` ${customMessage}` : ''}`,
  status: 401
});
export const err500 = (customMessage?: string): ApiResponse => ({
  message: `Server error.${customMessage ? ` ${customMessage}` : ''}`,
  status: 500
});
export const success200 = (customMessage?: string): ApiResponse => ({
  message: `Success.${customMessage ? ` ${customMessage}` : ''}`,
  status: 200
});
