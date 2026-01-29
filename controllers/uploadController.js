import { prisma } from "../lib/prisma.js";
import { supabase } from "../lib/supabase.js";

async function ensureFolderPath({ ownerId, rootFolderId, path }) {
  const parts = path.split("/").slice(0, -1);
  let parentId = rootFolderId ?? null;

  for (const name of parts) {
    let folder = await prisma.folder.findFirst({
      where: { ownerId, parentId, name },
    });

    if (!folder) {
      folder = await prisma.folder.create({
        data: { name, ownerId, parentId },
      });
    }

    parentId = folder.id;
  }

  return parentId;
}

export async function uploadFiles(req, res) {
  const userId = req.user.id;
  let lastFolderId = null;

  try {
    for (const file of req.files) {
      const folderId = await ensureFolderPath({
        ownerId: userId,
        rootFolderId: req.body.parentId || null,
        path: file.webkitRelativePath || file.originalname,
      });

      lastFolderId = folderId;

      const storagePath = `${userId}/${Date.now()}-${file.originalname}`;

      const { error } = await supabase.storage
        .from("uploads")
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      await prisma.file.create({
        data: {
          name: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          storagePath,
          ownerId: userId,
          folderId,
        },
      });
    }

    res.redirect(lastFolderId ? `/dashboard/${lastFolderId}` : "/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
}
