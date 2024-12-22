export const PORT: number = parseInt(process.env.PORT || "3000", 10);
export const DB_HOST: string | undefined = process.env.DB_HOST;
export const DB_USER: string | undefined = process.env.DB_USER;
export const DB_PASSWORD: string | undefined = process.env.DB_PASSWORD;
export const DB_NAME: string | undefined = process.env.DB_NAME;
export const JWT_SECRET: string = process.env.JWT_SECRET || "defaultJwtSecret";
export const SESSION_SECRET: string =
  process.env.SESSION_SECRET || "defaultSessionSecret";
export const GMAIL_USER: string | undefined = process.env.GMAIL_USER;
export const GMAIL_APP_PASSWORD: string | undefined =
  process.env.GMAIL_APP_PASSWORD;
export const GMAIL_SECRET_KEY: string | undefined =
  process.env.GMAIL_SECRET_KEY;
export const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL;
export const TOKEN_SECURE: boolean = Boolean(process.env.TOKEN_SECURE);
export const BACKEND_URL: string | undefined = process.env.BACKEND_URL;
