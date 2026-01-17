import {prisma} from '../lib/prisma.js';

export async function createUser(email, password, name) {
    const user = await prisma.user.create({
        data: {
            email,
            password,
            name,
            folders: {
                create: {
                    name: '/home',
                    parentId: null,
                },
            },
        },
        include: { folders: true},
    });

    console.log('User created with root folder:', user.folders[0]);
    return user;
}