import { v4 as uuid } from "uuid";

export const onRequestPost = async ({ env, request }) => {
  const { BUCKET } = env;
  const form = await request.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File))
    return new Response(JSON.stringify({ error: "file missing" }), { status: 400 });

  const id  = uuid();                    // identifiant mémoire
  const key = `photos/${id}`;            // clé R2

  await BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    // optionnel : .private = false si tu veux rendre public via r2.dev
  });

  // on renvoie seulement la clé → le front la convertira en URL API
  return Response.json({ id, key });
};
