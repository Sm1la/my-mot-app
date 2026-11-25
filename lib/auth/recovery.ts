export const passwordRecoveryCookie = "mot-password-recovery";

export const passwordRecoveryCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/reset-password",
  maxAge: 15 * 60,
};
