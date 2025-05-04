export const onRequestPut = async ({ env, request, params }) => {
    const TODOS = env.TODOS_KV;
    const id = params.id;
    const list = JSON.parse((await TODOS.get("all")) || "[]");
    const updated = list.map((t) => t.id === id ? { ...t, done: !t.done } : t);
    await TODOS.put("all", JSON.stringify(updated));
    return new Response(null, { status: 204 });
  };
  
  export const onRequestDelete = async ({ env, params }) => {
    const TODOS = env.TODOS_KV;
    const id = params.id;
    const list = JSON.parse((await TODOS.get("all")) || "[]");
    await TODOS.put("all", JSON.stringify(list.filter((t) => t.id !== id)));
    return new Response(null, { status: 204 });
  };
  