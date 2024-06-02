function buildHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  });
}

function buildResponse(body: object, status: number = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(),
  });
}

async function getJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get("Content-Type");

  if (contentType !== "application/json") {
    throw new ApplicationError("Invalid Content-Type", 422);
  }

  try {
    const body = await request.json();
    return body as T;
  } catch (_error) {
    throw new ApplicationError("Invalid JSON", 400);
  }
}

class ApplicationError extends Error {
  status: number;
  type: string = "ApplicationError";

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const kv = await Deno.openKv();

export { buildResponse, getJson, kv, ApplicationError };
