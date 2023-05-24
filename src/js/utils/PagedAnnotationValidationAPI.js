import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, textRequest, jsRequest, jjRequest, jjrequest, sRequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function createPagedAnnotationValidation(aegId, name, mode) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/paged-annotation-validation/create?aegId=" + aegId,
    body: JSON.stringify({ name: name, mode: mode}),
    method: 'POST'
  })
}

export function editAnnotationValidation(validationId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/paged-annotation-validation/editValidation/" + validationId,
    method: 'POST'
  })
}

export function stopPagedAnnotationValidation(validationId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/paged-annotation-validation/stop/" + validationId,
    method: 'POST'
  })
}

export function resumePagedAnnotationValidation(validationId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/paged-annotation-validation/resume/" + validationId,
    method: 'POST'
  })
}

export function commitAnnotationValidationPage(id, edits, lockId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jjrequest({
    url: API_BASE_URL + "/paged-annotation-validation/commit-page/" + id + "?lockId=" + lockId,
    body: JSON.stringify(edits),
    method: 'POST',
  })
}

export function getValidationProgress(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/paged-annotation-validation/progress/" + id,
    method: 'GET',
  })
}

export function getDatasetProgress(uuid) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/paged-annotation-validation/dataset-progress/" + uuid,
    method: 'GET',
  })
}

export function viewAnnotationValidation(id, currentPage, mode, serial, navigation, requestedPage) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  let url = API_BASE_URL + "/paged-annotation-validation/view/" + id + "?currentPage=" + currentPage + "&mode=" + mode;
  if (serial) {
    url = url + "&navigation=" + navigation;
  }
  else {
    url = url + "&requestedPage=" + requestedPage;
  }
  return request({
    url: url,
    method: 'GET'
  })
}

export function updatePagedAnnotationValidation(id, name, mode) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/paged-annotation-validation/update/" + id,
    body: JSON.stringify({ name: name, mode: mode}),
    method: 'POST'
  })
}

export function executePagedAnnotationValidation(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/paged-annotation-validation/execute/" + id,
    method: 'POST',
  })
}

export function clearPagedAnnotationValidationExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/paged-annotation-validation/clear-execution/" + id,
    method: 'POST'
  })
}

export function publishPagedAnnotationValidation(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/paged-annotation-validation/publish/" + id,
    method: 'POST',
  })
}

export function unpublishPagedAnnotationValidation(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/paged-annotation-validation/unpublish/" + id,
    method: 'POST',
  })
}

export function previewPagedAnnotationValidationExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/paged-annotation-validation/preview-last-execution/" + id,
    method: 'GET'
  });
}

export function previewPublishedPagedAnnotationValidationExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/paged-annotation-validation/preview-published-execution/" + id,
    method: 'GET'
  });
}

export function downloadPagedAnnotationValidationExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/paged-annotation-validation/download-last-execution/" + id,
    method: 'GET'
  });
}

export function downloadPublishedPagedAnnotationValidationExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/paged-annotation-validation/download-published-execution/" + id,
    method: 'GET'
  });
}
