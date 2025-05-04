/**
 * GET    /api/todos            → renvoie TodoCategory[]
 * POST   /api/todos            → crée une nouvelle catégorie
 */
export const onRequest = async ({ env, request }) => {
    const KV = env.TODOS_KV as KVNamespace;
    // GET : lire toutes les catégories
    if (request.method === "GET") {
      const raw = (await KV.get("all")) || "[]";
      return new Response(raw, {
        headers: { "Content-Type": "application/json" },
      });
    }
    // POST : créer une catégorie { id, name, tasks: [] }
    if (request.method === "POST") {
      const newCat = await request.json(); 
      const list = JSON.parse((await KV.get("all")) || "[]");
      list.push(newCat);
      await KV.put("all", JSON.stringify(list));
      return new Response(null, { status: 201 });
    }
    return new Response("Method Not Allowed", { status: 405 });
  };
  