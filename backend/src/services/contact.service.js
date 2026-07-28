import { ApiError } from '../utils/ApiError.js';
import * as contactRepository from '../repositories/contact.repository.js';

export const submitContact = async ({ name, email, message }) => {
  const contactMsg = await contactRepository.createContactMessageInDb({
    name,
    email,
    message,
  });

  return {
    message: 'Your inquiry has been received! Our team will get in touch shortly.',
    contact: contactMsg,
  };
};

export const getAllContactMessages = async () => {
  return await contactRepository.findAllContactMessages();
};

export const subscribeNewsletter = async (email) => {
  const existing = await contactRepository.findNewsletterSubscriberByEmail(email);
  if (existing) {
    return { message: 'You are already subscribed to our newsletter!' };
  }

  await contactRepository.createNewsletterSubscriberInDb(email);
  return { message: 'Thank you for subscribing to The Rising Stars Adventure newsletter!' };
};

export const getAllNewsletterSubscribers = async () => {
  return await contactRepository.findAllNewsletterSubscribers();
};
