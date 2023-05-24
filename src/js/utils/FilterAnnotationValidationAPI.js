import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { sRequest, textRequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function createFilterAnnotationValidation(aegId, name, filters) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/filter-annotation-validation/create?aegId=" + aegId,
    body: JSON.stringify({ name, filters }),
    method: 'POST'
  })
}

export function deleteFilterAnnotationValidation(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/filter-annotation-validation/delete/" + id,
    method: 'DELETE'
  });
}

export function updateFilterAnnotationValidation(id, name, filters) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/filter-annotation-validation/update/" + id,
    body: JSON.stringify({ name, filters }),
    method: 'POST'
  })
}

export function executeFilterAnnotationValidation(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/filter-annotation-validation/execute/" + id,
    method: 'POST',
  })
}

export function clearFilterAnnotationValidationExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/filter-annotation-validation/clear-execution/" + id,
    method: 'POST'
  })
}

export function publishFilterAnnotationValidation(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/filter-annotation-validation/publish/" + id,
    method: 'POST',
  })
}

export function unpublishFilterAnnotationValidation(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/filter-annotation-validation/unpublish/" + id,
    method: 'POST',
  })
}

export function previewFilterAnnotationValidationExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/filter-annotation-validation/preview-last-execution/" + id,
    method: 'GET'
  });
}

export function previewPublishedFilterAnnotationValidationExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/filter-annotation-validation/preview-published-execution/" + id,
    method: 'GET'
  });
}

export function downloadFilterAnnotationValidationExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/filter-annotation-validation/download-last-execution/" + id,
    method: 'GET'
  });
}

export function downloadPublishedFilterAnnotationValidationExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/filter-annotation-validation/download-published-execution/" + id,
    method: 'GET'
  });
}
