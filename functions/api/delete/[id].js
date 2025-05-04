export const onRequestDelete = async ({ env, params }) => {
    const MEM_KV = env.MEM_KV;
    const BUCKET = env.BUCKET;
    const id = params.id;                  // provient de l’URL /api/delete/<id>
  
    const list = JSON.parse((await MEM_KV.get("all")) || "[]");
    const memory = list.find((m) => m.id === id);
  
    if (!memory) return new Response("Not found", { status: 404 });
  
    // 1) supprimer les photos R2 (clé "photos/<uuid>")
    await Promise.all(
      memory.photos.map(async (url) => {
        // l’URL signée contient la clé après ".../photos/%3Cuuid%3E"
        const match = url.match(/photos\/([^/?]+)/);
        if (match) await BUCKET.delete(`photos/${match[1]}`);
      })
    );
  
    // 2) supprimer l’entrée dans KV
    const updated = list.filter((m) => m.id !== id);
    await MEM_KV.put("all", JSON.stringify(updated));
  
    return new Response("ok");
  };
  