import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, jsonSuccessFailureRequest } from './APIUtils.js';

export function newIndex(datasetId, indexStructureId, indexStructureIdentifier, indexEngine, indexStructures, keysMetadata) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var body;
  if (indexStructureId) {
    body = { indexStructureId, indexEngine }
  } else if (indexStructureIdentifier) {
    body = { indexStructureIdentifier, indexEngine, indexStructures, keysMetadata }
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/index/new?datasetId=" + datasetId,
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateIndex(id, idefault) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var body = { default: idefault }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/index/update/" + id,
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function deleteIndex(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/index/delete/" + id,
    method: 'DELETE'
  });
}

export function createIndex(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/index/create/" + id,
    method: 'POST',
  })
}

export function stopCreateIndex(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/index/stop-create/" + id,
    method: 'POST',
  })
}

export function destroyIndex(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/index/destroy/" + id,
    method: 'POST',
  })
}

export function getIndexes(datasetId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/index/get-all?datasetId=" + datasetId,
    method: 'GET'
  })
}
