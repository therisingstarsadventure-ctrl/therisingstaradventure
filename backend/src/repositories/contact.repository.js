import { prisma } from '../utils/db.js';

export const createContactMessageInDb = async (data) => {
  return await prisma.contactMessage.create({ data });
};

export const findAllContactMessages = async () => {
  return await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const createNewsletterSubscriberInDb = async (email) => {
  return await prisma.newsletterSubscriber.create({
    data: { email },
  });
};

export const findNewsletterSubscriberByEmail = async (email) => {
  return await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });
};

export const findAllNewsletterSubscribers = async () => {
  return await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });
};
