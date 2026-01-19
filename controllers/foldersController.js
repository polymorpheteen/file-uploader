import { prisma } from "../lib/prisma.js";

export async function createNewFolder(req, res) {
  const userId = req.user.id;
  const { name, parentId } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).send("Folder name is required");
  }

  try {
    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentId,
          ownerId: userId,
        },
      });

      if (!parentFolder) {
        return res.status(403).send("Invalid parent folder");
      }
    }

    await prisma.folder.create({
      data: {
        name: name.trim(),
        ownerId: userId,
        parentId: parentId || null,
      },
    });

    return res.redirect(parentId ? `/dashboard/${parentId}` : "/dashboard");
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).send("Folder already exists");
    }

    console.error("Folder creation failed:", err);
    return res.status(500).send("Could not create folder");
  }
}
