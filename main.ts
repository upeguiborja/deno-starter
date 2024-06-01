const API_PORT = 8080;

async function handleLogin(req: Request): Promise<Response> {
  return new Response("Login");
}

async function handleSignup(req: Request): Promise<Response> {
  return new Response("Signup");
}

const routes = {
  "/login": handleLogin,
  "/signup": handleSignup,
};

async function routeRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  if (Object.keys(routes).includes(path)) {
    const handler = routes[path as keyof typeof routes];

    if (handler) {
      return handler(req);
    } else {
      return new Response("Not Implemented", { status: 501 });
    }
  } else {
    return new Response("Not Found", { status: 404 });
  }
}

Deno.serve({ port: API_PORT }, async (request) => {
  return await routeRequest(request);
});
