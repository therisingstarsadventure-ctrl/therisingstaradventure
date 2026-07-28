import { ApiError } from '../utils/ApiError.js';
import * as cmsRepository from '../repositories/cms.repository.js';
import { cache } from '../utils/redis.js';
import { logAction } from './audit.service.js';

export const listCmsTreks = async (query) => {
  return await cmsRepository.findAllCmsTreks(query);
};

export const getCmsTrek = async (id) => {
  const trek = await cmsRepository.findCmsTrekById(id);
  if (!trek) throw new ApiError(404, 'Trek package not found.');
  return trek;
};

export const saveCmsTrek = async (data, user) => {
  const trek = await cmsRepository.createOrUpdateCmsTrek(data, user?.name || 'Admin');

  // Invalidate Redis Cache
  await cache.del('pkgs:all', `pkg:${data.id}`);
  await cache.invalidatePattern('search:*');

  // Audit Log
  await logAction({
    userId: user?.id,
    action: 'CMS_TREK_SAVED',
    entity: 'Trek',
    entityId: data.id,
    newValue: { title: data.title, status: data.status, version: trek.version },
  });

  return {
    message: `Trek '${data.title}' saved successfully (Version ${trek.version}).`,
    trek,
  };
};

export const duplicateTrek = async (id, newId, newTitle, user) => {
  const duplicated = await cmsRepository.duplicateCmsTrek(id, newId, newTitle);

  await cache.del('pkgs:all');
  await cache.invalidatePattern('search:*');

  await logAction({
    userId: user?.id,
    action: 'CMS_TREK_DUPLICATED',
    entity: 'Trek',
    entityId: newId,
    newValue: { sourceId: id, newId },
  });

  return {
    message: `Trek duplicated successfully as '${duplicated.title}'.`,
    trek: duplicated,
  };
};

export const executeBulkTrekAction = async ({ trekIds, action, status, leaderId }, user) => {
  if (action === 'setStatus' || action === 'publish' || action === 'archive') {
    const targetStatus = status || (action === 'publish' ? 'PUBLISHED' : action === 'archive' ? 'ARCHIVED' : 'DRAFT');
    await cmsRepository.updateBulkTreksStatus(trekIds, targetStatus);
  } else if (action === 'delete') {
    await cmsRepository.deleteBulkTreks(trekIds);
  }

  await cache.del('pkgs:all');
  await cache.invalidatePattern('search:*');

  await logAction({
    userId: user?.id,
    action: `CMS_BULK_${action.toUpperCase()}`,
    entity: 'Trek',
    newValue: { trekIds, action, status },
  });

  return { message: `Bulk action '${action}' completed on ${trekIds.length} treks.` };
};

export const generateBulkDepartures = async ({ trekId, startDate, endDate, daysOfWeek, totalSeats, tripLeaderId }, user) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const departures = [];

  const curr = new Date(start);
  while (curr <= end) {
    if (daysOfWeek.includes(curr.getDay())) {
      const depDate = new Date(curr);
      depDate.setHours(6, 0, 0, 0);
      departures.push({
        date: depDate,
        totalSeats: parseInt(totalSeats) || 30,
        tripLeaderId: tripLeaderId ? parseInt(tripLeaderId) : null,
      });
    }
    curr.setDate(curr.getDate() + 1);
  }

  if (departures.length === 0) {
    throw new ApiError(400, 'No matching departure dates found within the selected range.');
  }

  const result = await cmsRepository.createBulkDepartures(trekId, departures);

  await cache.del('trips:all', 'trips:upcoming');

  await logAction({
    userId: user?.id,
    action: 'CMS_BULK_DEPARTURES_CREATED',
    entity: 'Trip',
    entityId: trekId,
    newValue: { departuresCount: departures.length, startDate, endDate },
  });

  return {
    message: `Successfully generated ${departures.length} monthly departures for trek '${trekId}'.`,
    count: departures.length,
  };
};

export const getVersionHistory = async (trekId) => {
  return await cmsRepository.getTrekVersionHistory(trekId);
};

export const restoreTrekVersion = async (trekId, versionId, user) => {
  const versions = await cmsRepository.getTrekVersionHistory(trekId);
  const targetVersion = versions.find(v => v.id === parseInt(versionId));
  if (!targetVersion) throw new ApiError(404, 'Version history snapshot not found.');

  const versionData = targetVersion.data;
  return await saveCmsTrek(versionData, user);
};
