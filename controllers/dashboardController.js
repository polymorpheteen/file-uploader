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

  let currentFolder;
  let folders = [];
  let files = [];

  try {
    if (!folderId) {
      // Root folder, or no folder selected
      currentFolder = await prisma.folder.findFirst({
        where: {
          ownerId: userId,
          parentId: null, // Root folder
        },
      });

      if (!currentFolder) {
        currentFolder = await prisma.folder.create({
          data: {
            ownerId: userId,
            name: "Home", // Default root folder name
            parentId: null,
          },
        });
      }

      // Fetch root folders and files
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
          folderId: null, // Root files (if any)
        },
        orderBy: { name: "asc" },
      });
    } else {
      // Fetch specific folder by folderId
      currentFolder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          ownerId: userId,
        },
      });

      if (!currentFolder) {
        return res.status(404).send("Folder not found");
      }

      // Fetch subfolders and files for the current folder
      folders = await prisma.folder.findMany({
        where: { parentId: folderId },
        orderBy: { name: "asc" },
      });

      files = await prisma.file.findMany({
        where: { folderId },
        orderBy: { name: "asc" },
      });
    }

    // Build breadcrumb path for the current folder
    const breadcrumb = await buildBreadcrumb(currentFolder);

    // Render dashboard with current folder data
    res.render("dashboard", {
      user: req.user,
      currentFolder,
      breadcrumb,
      folders,
      files,
      parentFolderId: currentFolder.parentId, // Pass parentId for the back link
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
}
