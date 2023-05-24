import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, textRequest, jjrequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function createVocabularizer(datasetUri, onProperty, name, separator) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }


  return request({
    url: API_BASE_URL + "/vocabularizer/create",
    body: JSON.stringify({ datasetUri, onProperty, name, separator }),
    method: 'POST',
  })
}

export function getVocabulizers(datasetUri) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/vocabularizer/getAll?datasetUri=" + encodeURIComponent(datasetUri),
    method: 'GET',
  })
}

export function deleteVocabularizer(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/vocabularizer/delete/" + id,
    method: 'DELETE'
  });

}

export function executeVocabularizer(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/vocabularizer/execute/" + id,
    method: 'POST'
  });

}

export function viewVocabularizerExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/vocabularizer/lastExecution/" + id,
    method: 'GET'
  });

}

export function publishVocabularizer(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jjrequest({
    url: API_BASE_URL + "/vocabularizer/publish/" + id,
    method: 'POST',
  })
}

export function unpublishVocabularizer(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jjrequest({
    url: API_BASE_URL + "/vocabularizer/unpublish/" + id,
    method: 'POST',
  })
}

export function indexVocabularizer(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jjrequest({
    url: API_BASE_URL + "/vocabularizer/index/" + id,
    method: 'POST',
  })
}

export function unindexVocabularizer(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jjrequest({
    url: API_BASE_URL + "/vocabularizer/unindex/" + id,
    method: 'POST',
  })
}

export function cleanupVocabularizer(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/vocabularizer/cleanup/" + id,
    method: 'GET',
  })
}

export function vocabularyVocabularizer(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/vocabularizer/vocabulary/" + id,
    method: 'GET',
  })
}
