export const onRequest = async ({ env, request }) => {
    const TODOS = env.TODOS_KV;
  
    if (request.method === "GET") {
      const raw = (await TODOS.get("all")) || "[]";
      return new Response(raw, { headers: { "Content-Type": "application/json" } });
    }
  
    if (request.method === "POST") {
      // body = { id: "<uuid>", text: string, done: boolean }
      const todo = await request.json();
      const list = JSON.parse((await TODOS.get("all")) || "[]");
      list.push(todo);
      await TODOS.put("all", JSON.stringify(list));
      return new Response(null, { status: 201 });
    }
  
    return new Response("Method Not Allowed", { status: 405 });
  };
  