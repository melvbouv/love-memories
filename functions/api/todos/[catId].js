/**
 * DELETE /api/todos/:catId   → supprime la catégorie et toutes ses tâches
 */
export const onRequestDelete = async ({ env, params }) => {
    const KV = env.TODOS_KV as KVNamespace;
    const catId = params.catId;
    const list = JSON.parse((await KV.get("all")) || "[]");
    const updated = list.filter((c) => c.id !== catId);
    await KV.put("all", JSON.stringify(updated));
    return new Response(null, { status: 204 });
  };
  