import { ApplicationError, buildResponse, getJson, kv } from "../utils.ts";

interface SignupPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

const signupPayloadKeys = new Set([
  "email",
  "password",
  "first_name",
  "last_name",
]);

async function validatePayload(request: Request): Promise<SignupPayload> {
  const payload = await getJson<SignupPayload>(request);

  const arePayloadKeysValid = Object.keys(payload).every((key) =>
    signupPayloadKeys.has(key)
  );

  const arePayloadValuesValid = Object.values(payload).every(
    (value) => typeof value === "string"
  );

  if (arePayloadKeysValid && arePayloadValuesValid) {
    return payload;
  }

  throw new ApplicationError("Invalid Payload", 400);
}

async function createUserIfNotExists(payload: SignupPayload) {
  const user = await kv.get(["users", payload.email]);

  if (user.value) {
    throw new ApplicationError("User Already Exists", 409);
  }

  const result = await kv.set(["users", payload.email], payload);

  if (!result.ok) {
    throw new ApplicationError("Database error", 500);
  }

  return { ...payload, versionstamp: result.versionstamp };
}

async function signupHandler(request: Request): Promise<Response> {
  const payload = await validatePayload(request);
  const result = await createUserIfNotExists(payload);
  return buildResponse(result, 200);
}

export default signupHandler;
