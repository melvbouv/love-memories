// PUT    /api/todos/:catId/tasks/:taskId   → toggle `done`
// DELETE /api/todos/:catId/tasks/:taskId   → supprime la tâche

export const onRequestPut = async ({ env, params }) => {
    const KV = env.TODOS_KV;
    const { catId, taskId } = params;
  
    const list = JSON.parse((await KV.get("all")) || "[]");
    const updated = list.map((c) =>
      c.id === catId
        ? {
            ...c,
            tasks: c.tasks.map((t) =>
              t.id === taskId ? { ...t, done: !t.done } : t
            ),
          }
        : c
    );
  
    await KV.put("all", JSON.stringify(updated));
    return new Response(null, { status: 204 });
  };
  
  export const onRequestDelete = async ({ env, params }) => {
    const KV = env.TODOS_KV;
    const { catId, taskId } = params;
  
    const list = JSON.parse((await KV.get("all")) || "[]");
    const updated = list.map((c) =>
      c.id === catId
        ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }
        : c
    );
  
    await KV.put("all", JSON.stringify(updated));
    return new Response(null, { status: 204 });
  };
  