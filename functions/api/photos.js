export const onRequest = async ({ env, request }) => {
    const PHOTOS = env.PHOTOS_KV;
  
    if (request.method === "GET") {
      const raw = (await PHOTOS.get("all")) || "[]";
      return new Response(raw, { headers: { "Content-Type": "application/json" } });
    }
  
    if (request.method === "POST") {
      // client envoie { key: "photos/<uuid>", dateTaken: 1234567890 }
      const { key, dateTaken } = await request.json();
      const list = JSON.parse((await PHOTOS.get("all")) || "[]");
      list.push({ key, dateTaken });
      await PHOTOS.put("all", JSON.stringify(list));
      return new Response(null, { status: 201 });
    }
  
    return new Response("Method Not Allowed", { status: 405 });
  };
  