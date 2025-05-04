import { v4 as uuid } from "uuid";

export const onRequest = async ({ env, request }) => {
  const MEM_KV = env.MEM_KV;

  // ----- lire la liste -----
  if (request.method === "GET") {
    const raw = (await MEM_KV.get("all")) || "[]";
    return new Response(raw, {
      headers: { "Content-Type": "application/json" },
    });
  }

  // ----- ajouter un souvenir -----
  if (request.method === "POST") {
    const incoming = await request.json();     // {title,date,description,photos:[url],location,coords}
    incoming.id = uuid();

    const list = JSON.parse((await MEM_KV.get("all")) || "[]");
    list.push(incoming);
    await MEM_KV.put("all", JSON.stringify(list));

    return Response.json(incoming, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};
