// src/hooks/usePhotos.ts

import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import * as exifr from "exifr";
import * as idbKeyval from "idb-keyval";

export interface Photo {
    id: string;
    url: string;
    dateTaken: number;
}

export function usePhotos() {
    const [photos, setPhotos] = useState<Photo[]>([]);

    // ─── 1) Chargement initial depuis IndexedDB ───
    useEffect(() => {
        (async () => {
            const list: Photo[] = [];
            const keys = (await idbKeyval.keys()) as string[];
            for (const id of keys) {
                if (!id || id.endsWith("-meta")) continue;
                const blob = await idbKeyval.get<Blob>(id);
                if (!blob) continue;
                const meta = await idbKeyval.get<number>(`${id}-meta`);
                const dateTaken = meta ?? Date.now();
                list.push({ id, url: URL.createObjectURL(blob), dateTaken });
            }
            list.sort((a, b) => a.dateTaken - b.dateTaken);
            setPhotos(list);
        })();
    }, []);

    // ─── Ajout local sans remonter au serveur (pour sync init) ───
    async function addPhotoLocal(id: string, blob: Blob, dateTaken: number) {
        // 👇 Vérifie si la photo existe déjà avant d'ajouter
        const existing = photos.find((p) => p.id === id);
        if (existing) {
            console.log(`Photo ${id} déjà présente, on skip.`);
            return;
        }

        await idbKeyval.set(id, blob);
        await idbKeyval.set(`${id}-meta`, dateTaken);
        setPhotos((prev) => {
            const next = [...prev, { id, url: URL.createObjectURL(blob), dateTaken }];
            next.sort((a, b) => a.dateTaken - b.dateTaken);
            return next;
        });
    }

    // ─── 2) Ajout de nouveaux fichiers (local + upload + KV) ───
    async function addFiles(files: FileList) {
        for (const file of Array.from(files)) {
            // a) compression
            const MAX_MB = 0.5;
            const compressed =
                file.size > MAX_MB * 1024 * 1024
                    ? await imageCompression(file, {
                        maxSizeMB: MAX_MB,
                        maxWidthOrHeight: 2048,
                        useWebWorker: true,
                    })
                    : file;

            // b) EXIF dateTaken
            let dateTaken = file.lastModified;
            try {
                const exif = await exifr.parse(compressed, ["DateTimeOriginal"]);
                if (exif?.DateTimeOriginal) {
                    dateTaken = exif.DateTimeOriginal.getTime();
                }
            } catch {
                // ignore
            }

            // c) upload R2
            const fd = new FormData();
            fd.append("file", compressed, file.name);
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: fd,
            });
            if (!uploadRes.ok) throw new Error("upload failed");
            const { key } = await uploadRes.json();

            // d) enregistrer en KV
            await fetch("/api/photos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, dateTaken }),
            });

            // e) stockage local
            await idbKeyval.set(key, compressed);  // ✅ key au lieu de id
            await idbKeyval.set(`${key}-meta`, dateTaken);

            setPhotos((prev) => {
                const next = [...prev, { id: key, url: `/api/file/${key}`, dateTaken }];
                next.sort((a, b) => a.dateTaken - b.dateTaken);
                return next;
            });
        }
    }

    // ─── 3) Suppression corrigée (local + KV + R2) ───
    async function remove(id: string) {
        // ✅ Si id commence déjà par photos/, utilise tel quel, sinon ajoute le préfixe
        const key = id; // id est déjà "photos/{uuid}"

        try {
            const res = await fetch(`/api/photos/${encodeURIComponent(key)}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Échec suppression serveur : ${res.statusText}`);

            await idbKeyval.del(key);
            await idbKeyval.del(`${key}-meta`);
            setPhotos((prev) => prev.filter((p) => p.id !== key));
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    }

    return { photos, addFiles, remove, addPhotoLocal };
}
