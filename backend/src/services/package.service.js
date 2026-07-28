import { ApiError } from '../utils/ApiError.js';
import * as trekRepository from '../repositories/trek.repository.js';

export const getAllPackages = async (query) => {
  return await trekRepository.findAllTreks(query);
};

export const getPackageById = async (id) => {
  const packageData = await trekRepository.findTrekById(id);
  if (!packageData) {
    throw new ApiError(404, 'Package not found.');
  }
  return packageData;
};

export const createPackage = async (data) => {
  return await trekRepository.createTrek(data);
};

export const updatePackage = async (id, data) => {
  const existing = await trekRepository.findTrekById(id);
  if (!existing) {
    throw new ApiError(404, 'Package not found.');
  }
  return await trekRepository.updateTrek(id, data);
};

export const deletePackage = async (id) => {
  const existing = await trekRepository.findTrekById(id);
  if (!existing) {
    throw new ApiError(404, 'Package not found.');
  }
  await trekRepository.deleteTrek(id);
  return { message: 'Package deleted successfully.' };
};
