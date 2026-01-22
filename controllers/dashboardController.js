import { prisma } from "../lib/prisma.js";

async function buildBreadcrumb(folder) {
  const path = [];

  let current = folder;

  while (current) {
    path.unshift(current);
    if (!current.parentId) break;

    current = await prisma.folder.findUnique({
      where: { id: current.parentId },
    });
  }

  return path;
}

export async function showCurrentDirectory(req, res) {
  const userId = req.user.id;
  const { folderId } = req.params;

  let currentFolder = null;
  let folders = [];
  let files = [];

  try {
    if (!folderId) {
      // ROOT VIEW
      currentFolder = null;

      folders = await prisma.folder.findMany({
        where: {
          ownerId: userId,
          parentId: null,
        },
        orderBy: { name: "asc" },
      });

      files = await prisma.file.findMany({
        where: {
          ownerId: userId,
          folderId: null,
        },
        orderBy: { name: "asc" },
      });
    } else {
      currentFolder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          ownerId: userId,
        },
      });

      if (!currentFolder) {
        return res.status(404).send("Folder not found");
      }

      folders = await prisma.folder.findMany({
        where: {
          ownerId: userId,
          parentId: folderId,
        },
        orderBy: { name: "asc" },
      });

      files = await prisma.file.findMany({
        where: {
          ownerId: userId,
          folderId: folderId,
        },
        orderBy: { name: "asc" },
      });
    }

    const breadcrumb = currentFolder
      ? await buildBreadcrumb(currentFolder)
      : [];

    const items = [
      ...folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        type: "folder",
      })),
      ...files.map((file) => ({
        id: file.id,
        name: file.name,
        type: "file",
        size: file.size,
      })),
    ];

    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    res.render("dashboard", {
      user: req.user,
      currentFolder,
      breadcrumb,
      items,
      parentFolderId: currentFolder?.parentId || null,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
}
