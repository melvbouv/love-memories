import { v4 as uuid } from "uuid";

export const onRequestPost = async ({ env, request }) => {
  const { BUCKET } = env;

  const form = await request.formData();
  const file = form.get("file");
  if (!file) return new Response("file missing", { status: 400 });

  const id = uuid();                        // clé unique
  const key = `photos/${id}`;

  await BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  const url = await BUCKET.getSignedUrl(key, {
    method: "GET",
    expires: 60 * 60 * 24 * 7,              // URL valable 7 jours
  });

  return Response.json({ id, url });
};
