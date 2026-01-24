import { prisma } from "../lib/prisma.js";

export async function viewSharedFolder(req, res) {
    const { token } = req.params;

    const link = await prisma.shareLink.findUnique({
        where: {
            token,
        },
        include: {
            folder: {
                include: {
                    children: true,
                    files: true
                }
            }
        }
    })

    if (!link || !link.folder) {
        return res.status(404).send("Invalid or expired link");
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
        return res.status(410).send("Link expired");
    }

    res.render("sharedFolder", {
        folder: link.folder,
    });
}