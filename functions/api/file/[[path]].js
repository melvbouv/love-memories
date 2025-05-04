// functions/api/file/[[path]].js
export const onRequestGet = async ({ env, params }) => {
  const { BUCKET } = env;
  const key = params.path;                // ← 'photos/<uuid>'

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
