import { prisma } from '../utils/db.js';

export const submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields (name, email, message) are required.' });
    }

    const newMessage = await prisma.contactMessage.create({
      data: { name, email, message }
    });

    res.status(201).json({
      message: 'Inquiry submitted successfully. We will contact you soon.',
      inquiry: newMessage
    });
  } catch (error) {
    next(error);
  }
};

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      return res.status(200).json({ message: 'You are already subscribed to our newsletter!' });
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email }
    });

    res.status(201).json({
      message: 'Thank you for subscribing to our newsletter!',
      subscriber
    });
  } catch (error) {
    next(error);
  }
};

export const getAllContactMessages = async (req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getAllNewsletterSubscribers = async (req, res, next) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(subscribers);
  } catch (error) {
    next(error);
  }
};
