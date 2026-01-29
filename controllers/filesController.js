import { prisma } from "../lib/prisma.js";
import { supabase } from "../lib/supabase.js";

export async function removeFiles(req, res) {
  const userId = req.user.id;
  const fileId = req.params.id;
  const parentFolderId = req.body.parentId;

  try {
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
        ownerId: userId,
      },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    const { error } = await supabase.storage
      .from("uploads")
      .remove([file.storagePath]);

    if (error) throw error;

    await prisma.file.delete({
      where: {
        id: fileId,
      },
    });

    if (parentFolderId) {
      res.redirect(`/dashboard/${parentFolderId}`);
    } else {
      res.redirect("/dashboard");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function getFilesInfo(req, res) {
  const fileId = req.params.id;
  const userId = req.user.id;

  try {
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
        ownerId: userId,
      },
      include: {
        folder: true,
      },
    });

    if (!file) return res.status(404).json({ error: "File not found" });

    res.json({
      id: file.id,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
      folder: file.folder?.name ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load file info" });
  }
}

export async function downloadFile(req, res) {
  const fileId = req.params.id;
  const userId = req.user.id;

  try {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        ownerId: userId,
      },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    const { data, error } = await supabase.storage
      .from("uploads")
      .createSignedUrl(file.storagePath, 60);

    if (error) throw error;

    res.redirect(`${data.signedUrl}&download=${encodeURIComponent(file.name)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Could not download file");
  }
}
