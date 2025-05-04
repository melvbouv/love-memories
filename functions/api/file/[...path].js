export const onRequestGet = async ({ env, params }) => {
  const { BUCKET } = env;
  const key = params.path;        // ← le nom du param, sans les points

  const obj = await BUCKET.get(key);
  if (!obj) return new Response("Not found", { status: 404 });

  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000",
    },
  });
};
