import crypto from "crypto";
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

export async function renameFolder(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).send("Folder name required");
  }

  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!folder) {
      return res.status(404).send("Folder not found");
    }

    await prisma.folder.update({
      where: { id },
      data: { name: name.trim() },
    });

    res.redirect(
      folder.parentId ? `/dashboard/${folder.parentId}` : "/dashboard",
    );
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).send("Folder name already exists");
    }

    console.error(err);
    res.status(500).send("Rename failed");
  }
}

async function deleteFolderRecursive(folderId, userId) {
  const children = await prisma.folder.findMany({
    where: {
      parentId: folderId,
      ownerId: userId,
    },
  });

  for (const child of children) {
    await deleteFolderRecursive(child.id, userId);
  }

  await prisma.file.deleteMany({
    where: {
      folderId,
      ownerId: userId,
    },
  });

  await prisma.folder.delete({
    where: { id: folderId },
  });
}

export async function removeFolder(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!folder) {
      return res.status(404).send("Folder not found");
    }

    const parentId = folder.parentId;

    await deleteFolderRecursive(id, userId);

    res.redirect(parentId ? `/dashboard/${parentId}` : "/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
}

export async function createFolderShareLink(req, res) {
  const folderId = req.params.id;
  const userId = req.user.id;

  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        ownerId: userId,
      },
    });

    if (!folder) {
      return res.status(404).send("Folder not found");
    }

    const token = crypto.randomBytes(24).toString("hex");

    const shareLink = await prisma.shareLink.create({
      data: {
        token,
        ownerId: userId,
        folderId: folder.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      url: `${req.protocol}://${req.get("host")}/share/${shareLink.token}`,
    });
  } catch (err) {
    console.error(err)
    res.status(500).send("Could not create share link");
  }
}