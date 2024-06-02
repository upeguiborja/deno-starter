import { getToken } from "../security.ts";
import { ApplicationError, buildResponse, getJson, kv } from "../utils.ts";
import type { SignupPayload } from "./signupHandler.ts";

interface LoginPayload {
  email: string;
  password: string;
}

const loginPayloadKeys = new Set(["email", "password"]);

async function validatePayload(request: Request): Promise<LoginPayload> {
  const payload = await getJson<LoginPayload>(request);

  const arePayloadKeysValid = Object.keys(payload).every((key) =>
    loginPayloadKeys.has(key)
  );

  const arePayloadValuesValid = Object.values(payload).every(
    (value) => typeof value === "string"
  );

  if (arePayloadKeysValid && arePayloadValuesValid) {
    return payload;
  }

  throw new ApplicationError("Invalid Payload", 400);
}

async function validateUserPassword(payload: LoginPayload) {
  const result = await kv.get<SignupPayload>(["users", payload.email]);

  if (result.value && result.value.password === payload.password) {
    const email = result.value.email;
    const token = await getToken(email);
    return buildResponse({ token }, 200);
  }

  throw new ApplicationError("Unauthorized", 401);
}

async function loginHandler(request: Request) {
  const payload = await validatePayload(request);
  return await validateUserPassword(payload);
}

export default loginHandler;
