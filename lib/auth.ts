import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret"
);

// 建立 JWT
export async function signToken(payload: Record<string, any>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// 驗證 JWT

export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      id: Number(payload.id),
      email: String(payload.email),
      name: payload.name ? String(payload.name) : undefined,
      role: payload.role ? String(payload.role) : undefined,
    };
  } catch {
    return null;
  }
}

// lib/types/auth.ts
export interface JWTPayload {
  id: number;
  email: string;
  name?: string;
  role?: string;
}

