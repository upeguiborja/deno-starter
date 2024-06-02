import * as jose from "https://deno.land/x/jose@v5.3.0/index.ts";

const textDecoder = new TextEncoder();

// TODO: Replace with a real secret key on production.
const JWT_KEY = textDecoder.encode("super-secret-development-key");

async function getToken(email: string) {
  return await new jose.SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(JWT_KEY);
}

export { getToken };
