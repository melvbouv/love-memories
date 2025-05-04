// /functions/api/file/[key].js
export const onRequestGet = async ({ env, params }) => {
    const { BUCKET } = env;
    
    // Corrige la clé pour supprimer le préfixe "photos/"
    const key = params.key.replace(/^photos\//, '');
  
    try {
      const file = await BUCKET.get(key);
      if (!file) {
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