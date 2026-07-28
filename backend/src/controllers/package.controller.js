import { asyncHandler } from '../utils/asyncHandler.js';
import * as packageService from '../services/package.service.js';

export const getAllPackages = asyncHandler(async (req, res) => {
  const packages = await packageService.getAllPackages(req.query);
  res.json(packages);
});

export const getPackageById = asyncHandler(async (req, res) => {
  const packageData = await packageService.getPackageById(req.params.id);
  res.json(packageData);
});

export const createPackage = asyncHandler(async (req, res) => {
  const newPackage = await packageService.createPackage(req.body);
  res.status(201).json({
    message: 'Trek package created successfully.',
    package: newPackage,
  });
});

export const updatePackage = asyncHandler(async (req, res) => {
  const updatedPackage = await packageService.updatePackage(req.params.id, req.body);
  res.json({
    message: 'Trek package updated successfully.',
    package: updatedPackage,
  });
});

export const deletePackage = asyncHandler(async (req, res) => {
  const result = await packageService.deletePackage(req.params.id);
  res.json(result);
});
