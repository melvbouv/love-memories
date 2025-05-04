export const onRequestGet = async ({ env, params }) => {
    const { BUCKET } = env;
    const key = params["*"];              // récupère tout après /api/file/
  
    const obj = await BUCKET.get(key);
    if (!obj) return new Response("Not found", { status: 404 });
  
    return new Response(obj.body, {
      headers: {
        "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",  // 1 an
      },
    });
  };
  