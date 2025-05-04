// src/hooks/usePhotos.ts
import { useCallback, useEffect, useState } from "react";
import { get, set, del, keys } from "idb-keyval";
import * as exifr from "exifr";
import imageCompression from "browser-image-compression";
import { v4 as uuid } from "uuid";

export interface Photo {
    id: string;
    blob: Blob;           // original (ou compressé)
    url: string;          // objectURL pour <img>
    dateTaken: number;    // timestamp (ms)
}

const DB_PREFIX = "photo-";

export function usePhotos() {
    const [photos, setPhotos] = useState<Photo[]>([]);

    // ---------- chargement au boot ----------
    useEffect(() => {
        (async () => {
            const ids = await keys();
            const photoIds = ids.filter(
                (k) =>
                    String(k).startsWith(DB_PREFIX) &&      // préfixe
                    !String(k).endsWith("-meta")            // exclut les méta-clés
            );
            const loaded = await Promise.all(
                photoIds.map(async (k) => {
                    const blob = (await get<Blob>(k))!;
                    const id = String(k).slice(DB_PREFIX.length);
                    const url = URL.createObjectURL(blob);
                    const meta = (await get<Pick<Photo, "dateTaken">>(`${k}-meta`)) || {
                        dateTaken: Date.now(),
                    };
                    return { id, blob, url, ...meta } as Photo;
                })
            );
            loaded.sort((a, b) => a.dateTaken - b.dateTaken); // récents en bas
            setPhotos(loaded);
        })();
    }, []);

    // ---------- ajouter ----------
    const addFiles = useCallback(async (fileList: FileList | File[]) => {
        const files = Array.from(fileList);
        const newPhotos: Photo[] = [];

        for (const file of files) {
            // --- Compression ≤ 500 k o ---
            const MAX_SIZE_MB = 0.5;             // ≈ 512 k o
            const blob =
                file.size > MAX_SIZE_MB * 1024 * 1024
                    ? await imageCompression(file, {
                        maxSizeMB: MAX_SIZE_MB,
                        maxWidthOrHeight: 2500,      // garde une définition correcte
                        useWebWorker: true,
                    })
                    : file;
            // lecture EXIF
            let dateTaken = Date.now();
            try {
                const { DateTimeOriginal } = await exifr.parse(blob, ["DateTimeOriginal"]);
                if (DateTimeOriginal) dateTaken = DateTimeOriginal.getTime();
            } catch {
                dateTaken = file.lastModified; // fallback
            }

            const id = uuid();
            await set(DB_PREFIX + id, blob);
            await set(`${DB_PREFIX + id}-meta`, { dateTaken });

            newPhotos.push({
                id,
                blob,
                url: URL.createObjectURL(blob),
                dateTaken,
            });
        }

        setPhotos((prev) =>
            [...prev, ...newPhotos].sort((a, b) => a.dateTaken - b.dateTaken)
        );
    }, []);

    // ---------- supprimer ----------
    const remove = useCallback(async (id: string) => {
        await del(DB_PREFIX + id);
        await del(`${DB_PREFIX + id}-meta`);
        setPhotos((p) => p.filter((ph) => ph.id !== id));
    }, []);

    return { photos, addFiles, remove };
}
