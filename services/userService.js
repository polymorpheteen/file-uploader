import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const SALT_ROUNDS = 12;

export async function createUser(email, password, name) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        folders: {
          create: {
            name: "/home",
            parentId: null,
          },
        },
      },
      include: { folders: true },
    });

    console.log("User created with root folder:", user.folders[0]);
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("User creation failed");
  }
}
