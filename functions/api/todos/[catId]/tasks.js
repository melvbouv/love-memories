/**
 * POST /api/todos/:catId/tasks 
 *    body = { id, text, done, category }
 */
export const onRequestPost = async ({ env, params, request }) => {
    const KV = env.TODOS_KV as KVNamespace;
    const catId = params.catId;
    const newTask = await request.json();
  
    const list = JSON.parse((await KV.get("all")) || "[]");
    const updated = list.map((c) =>
      c.id === catId
        ? { ...c, tasks: [...c.tasks, newTask] }
        : c
    );
    await KV.put("all", JSON.stringify(updated));
    return new Response(null, { status: 201 });
  };
  