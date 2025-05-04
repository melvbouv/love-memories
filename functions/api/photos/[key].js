export const onRequestDelete = async ({ env, params }) => {
    const PHOTOS = env.PHOTOS_KV;
    const BUCKET = env.BUCKET;
    const key = params.key;  // e.g. "photos/abcd-1234"
  
    // supprime le blob
    await BUCKET.delete(key);
  
    // supprime metadata
    const list = JSON.parse((await PHOTOS.get("all")) || "[]");
    const updated = list.filter((p) => p.key !== key);
    await PHOTOS.put("all", JSON.stringify(updated));
  
    return new Response(null, { status: 204 });
  };
  