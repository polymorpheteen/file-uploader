import { prisma } from "../lib/prisma.js";

export async function removeFiles(req, res) {
  const userId = req.user.id;
  const fileId = req.params.id;
  const parentFolderId = req.body.parentId;

  try {
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file || file.ownerId !== userId) {
      return res.status(404).send("File not found");
    }

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

  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
      ownerId: userId,
    },
    select: {
      name: true,
      size: true,
      size: true,
      mimeType: true,
      createdAt: true,
    },
  });

  if (!file) return res.status(404).json({ error: "File not found" });

  res.json(file);
}
