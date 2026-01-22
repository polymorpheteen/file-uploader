import { prisma } from "../lib/prisma.js";

export async function uploadFiles(req, res) {
  const userId = req.user.id;
  const { parentId } = req.body;

  if (parentId) {
    const parent = await prisma.folder.findFirst({
      where: {
        id: parentId,
        ownerId: userId,
      },
    });

    if (!parent) {
      return res.status(403).send("Invalid destination folder");
    }
  }

  for (const file of req.files) {
    await prisma.file.create({
      data: {
        name: file.originalname.split("/").pop(),
        size: file.size,
        mimeType: file.mimetype,
        storagePath: file.path,
        ownerId: userId,
        folderId: parentId || null,
      },
    });
  }

  res.redirect(parentId ? `/dashboard/${parentId}` : "/dashboard");
}
