import { asyncHandler } from '../utils/asyncHandler.js';
import * as cmsService from '../services/cms.service.js';

export const listTreks = asyncHandler(async (req, res) => {
  const treks = await cmsService.listCmsTreks(req.query);
  res.json(treks);
});

export const getTrek = asyncHandler(async (req, res) => {
  const trek = await cmsService.getCmsTrek(req.params.id);
  res.json(trek);
});

export const saveTrek = asyncHandler(async (req, res) => {
  const result = await cmsService.saveCmsTrek(req.body, req.user);
  res.status(201).json(result);
});

export const duplicateTrek = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newId, newTitle } = req.body;
  const result = await cmsService.duplicateTrek(id, newId || `${id}-copy-${Date.now()}`, newTitle, req.user);
  res.status(201).json(result);
});

export const bulkAction = asyncHandler(async (req, res) => {
  const result = await cmsService.executeBulkTrekAction(req.body, req.user);
  res.json(result);
});

export const bulkCreateDepartures = asyncHandler(async (req, res) => {
  const result = await cmsService.generateBulkDepartures(req.body, req.user);
  res.status(201).json(result);
});

export const getVersions = asyncHandler(async (req, res) => {
  const versions = await cmsService.getVersionHistory(req.params.id);
  res.json(versions);
});

export const restoreVersion = asyncHandler(async (req, res) => {
  const result = await cmsService.restoreTrekVersion(req.params.id, req.params.versionId, req.user);
  res.json(result);
});
