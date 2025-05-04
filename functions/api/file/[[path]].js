// functions/api/file/[[path]].js
export const onRequestGet = async ({ env, params }) => {
  const { BUCKET } = env;
  const key = Array.isArray(params.path)
    ? params.path.join("/")              // "photos/<uuid>"
    : params.path;                       // sécurité si jamais string

  const obj = await BUCKET.get(key);
  if (!obj) return new Response("Not found", { status: 404 });

  return new Response(obj.body, {
    headers: {
      "Content-Type":
        obj.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000",
    },
  });
};
