export const onRequestDelete = async ({ env, params }) => {
    const PHOTOS = env.PHOTOS_KV;
    const BUCKET = env.BUCKET;
    const key = params.key;       // e.g. "photos/abcd-1234"
    await BUCKET.delete(key);     // supprime le blob
    const list = JSON.parse((await PHOTOS.get("all")) || "[]");
    await PHOTOS.put(
      "all",
      JSON.stringify(list.filter((p) => p.key !== key))
    );
    return new Response(null, { status: 204 });
  };
  