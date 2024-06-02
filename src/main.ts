import loginHandler from "./handlers/loginHandler.ts";
import signupHandler from "./handlers/signupHandler.ts";
import { ApplicationError, buildResponse } from "./utils.ts";

const API_PORT = 8080;

const enum HttpMethod {
  POST = "POST",
  GET = "GET",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
}

type RouteHandler = {
  [path: string]:
    | {
        [method in HttpMethod]?: (request: Request) => Promise<Response>;
      }
    | null;
};

const routes: RouteHandler = {
  "/login": {
    [HttpMethod.POST]: loginHandler,
  },
  "/signup": {
    [HttpMethod.POST]: signupHandler,
  },
};

async function routeRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  const handler =
    routes[path as keyof typeof routes]?.[request.method as HttpMethod];

  if (handler) {
    try {
      return await handler(request);
    } catch (error) {
      if (error.type === ApplicationError.name) {
        return buildResponse({ message: error.message }, error.status);
      }

      return buildResponse({ message: "Unhandled Error" }, 500);
    }
  } else {
    return buildResponse({ message: "Not Found" }, 404);
  }
}

Deno.serve({ port: API_PORT }, async (request) => {
  return await routeRequest(request);
});
