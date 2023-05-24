import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function giveAccessToAllDatasets(campaignId, userId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/access/createAll?campaignId=" + campaignId + "&userId=" + userId,
    method: 'POST',
  })
}
export function removeAccessFromAll(campaignId, userId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/access/deleteAll?campaignId=" + campaignId + "&userId=" + userId,
    method: 'POST',
  })
}


export function assignDatasetToUserInCampaign(campaignId, userId, datasetUri) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  // if (collectionId) {
  //   return request({
  //     url: API_BASE_URL + "/access/createById?campaignId="+ campaignId + "&validatorId" + validatorId + "&collectionId=" + collectionId,
  //     method: 'POST',
  //   });
  // }
  // else if (uuid) {
    return request({
      url: API_BASE_URL + "/access/create?campaignId="+ campaignId + "&userId=" + userId + "&datasetUri=" + datasetUri,
      method: 'POST',
    });
  // }
}

// to remove once assigning of dataset in campaing completed -- same as above
export function createDatasetAccess(campaignId, userId, datasetUri) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  // if (collectionId) {
  //   return request({
  //     url: API_BASE_URL + "/access/createById?campaignId="+ campaignId + "&validatorId" + validatorId + "&collectionId=" + collectionId,
  //     method: 'POST',
  //   });
  // }
  // else if (uuid) {
    return request({
      url: API_BASE_URL + "/access/create?campaignId="+ campaignId + "&userId=" + userId + "&datasetUri=" + datasetUri,
      method: 'POST',
    });
  // }
}

export function removeDatasetAccess(campaignId, userId, datasetUri) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/access/delete?campaignId="+ campaignId + "&userId=" + userId + "&datasetUri=" + datasetUri,
    method: 'POST',
  });
}
