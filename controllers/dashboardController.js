import { prisma } from "../lib/prisma.js";

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

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
        createdAt: folder.createdAt,
        type: "folder",
      })),
      ...files.map((file) => ({
        id: file.id,
        name: file.name,
        type: "file",
        createdAt: file.createdAt,
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
      timeAgo,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
}
