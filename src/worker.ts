const presentationsPath = "/api/presentations";
const browserCacheTtlSeconds = 60;
const edgeCacheTtlSeconds = 10 * 60;
const staleWhileRevalidateSeconds = 60 * 60;

const presentationResponseHeaders = (upstream?: Response) => {
  const headers = new Headers({
    "Cache-Control": `public, max-age=${browserCacheTtlSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
    "Cloudflare-CDN-Cache-Control": `public, max-age=${edgeCacheTtlSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });

  for (const name of ["ETag", "Last-Modified"] as const) {
    const value = upstream?.headers.get(name);
    if (value) headers.set(name, value);
  }

  return headers;
};

const proxyPresentations = async (request: Request, env: Env): Promise<Response> => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return Response.json(
      { error: "Method not allowed" },
      {
        status: 405,
        headers: {
          Allow: "GET, HEAD",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const upstream = await fetch(env.PRESENTATIONS_SOURCE_URL, {
      method: request.method,
      headers: { Accept: "application/json" },
      cf: {
        cacheEverything: true,
        cacheTtlByStatus: {
          "200-299": edgeCacheTtlSeconds,
          "300-599": -1,
        },
      },
    });

    if (!upstream.ok) {
      console.error(
        JSON.stringify({
          message: "Presentations upstream returned an error",
          status: upstream.status,
        }),
      );

      return new Response(
        request.method === "HEAD"
          ? null
          : JSON.stringify({ error: "Unable to load presentations" }),
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store",
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }

    return new Response(request.method === "HEAD" ? null : upstream.body, {
      status: upstream.status,
      headers: presentationResponseHeaders(upstream),
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        message: "Failed to fetch presentations upstream",
        error: error instanceof Error ? error.message : String(error),
      }),
    );

    return new Response(
      request.method === "HEAD" ? null : JSON.stringify({ error: "Unable to load presentations" }),
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }
};

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === presentationsPath) {
      return proxyPresentations(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
