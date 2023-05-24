import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, jsonSuccessFailureRequest } from './APIUtils.js';

export function createUserTask(datasetId, name, tasks, cronExpression) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var object = {name, tasks, cronExpression};

  return request({
    url: API_BASE_URL + "/user-tasks/create/datasetId=" + datasetId,
    body: JSON.stringify(object),
    method: 'POST',
  })
}

export function updateUserTask(id, name, tasks, cronExpression) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var object = {name, tasks, cronExpression};

  return request({
    url: API_BASE_URL + "/user-tasks/update/" + id,
    body: JSON.stringify(object),
    method: 'POST',
  })
}

export function getUserTasks(datasetId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/user-tasks/get-all?datasetId=" + datasetId,
    method: 'GET'
  })
}

export function runUserTask(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/user-tasks/run/" + id,
    method: 'POST',
  })
}

export function scheduleUserTask(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/user-tasks/schedule/" + id,
    method: 'POST',
  })
}

export function unscheduleUserTask(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/user-tasks/unschedule/" + id,
    method: 'POST',
  })
}

export function validateCronExpression(expression) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/user-tasks/validate-cron-expression?expression=" + encodeURIComponent(expression),
    method: 'GET',
  })
}
