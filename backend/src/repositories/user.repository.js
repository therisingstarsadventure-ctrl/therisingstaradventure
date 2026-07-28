import { prisma } from '../utils/db.js';

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
};

export const createUser = async (data) => {
  return await prisma.user.create({ data });
};

export const countUsers = async () => {
  return await prisma.user.count();
};
