export const onRequestGet = async ({ env, params }) => {
    const { BUCKET } = env;
    const key = decodeURIComponent(params.key);

    try {
      const file = await BUCKET.get(key);
      if (!file) {
        console.error("Fichier non trouvé sur R2 avec la clé : ", key);
        return new Response("Not Found", { status: 404 });
      }

      const headers = new Headers();
      file.writeHttpMetadata(headers);
      headers.set("etag", file.etag);

      return new Response(file.body, { headers });
    } catch (e) {
      console.error("Erreur chargement fichier R2 :", e);
      return new Response("Internal Server Error", { status: 500 });
    }
};