import { asyncHandler } from '../utils/asyncHandler.js';
import * as contactService from '../services/contact.service.js';

export const submitContact = asyncHandler(async (req, res) => {
  const result = await contactService.submitContact(req.body);
  res.status(201).json(result);
});

export const getAllContactMessages = asyncHandler(async (req, res) => {
  const messages = await contactService.getAllContactMessages();
  res.json(messages);
});

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const result = await contactService.subscribeNewsletter(req.body.email);
  res.status(201).json(result);
});

export const getAllNewsletterSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await contactService.getAllNewsletterSubscribers();
  res.json(subscribers);
});
