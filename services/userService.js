import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const SALT_ROUNDS = 12;

export async function createUser(email, password, name) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      await tx.folder.create({
        data: {
          name: "Home",
          parentId: null,
          ownerId: user.id,
        },
      });

      return user;
    });

    console.log("User created with root folder:", result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("User creation failed");
  }
}
