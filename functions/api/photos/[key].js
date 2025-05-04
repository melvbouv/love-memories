export const onRequestDelete = async ({ env, params }) => {
    const PHOTOS = env.PHOTOS_KV;
    const BUCKET = env.BUCKET;
    const key = params.key; // clé complète venant du frontend
  
    try {
      await BUCKET.delete(key); // supprime le blob R2
  
      const list = JSON.parse((await PHOTOS.get("all")) || "[]");
      const newList = list.filter((p) => p.key !== key);
      await PHOTOS.put("all", JSON.stringify(newList));
  
      return new Response(null, { status: 204 });
    } catch (e) {
      console.error("Erreur suppression serveur :", e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  };