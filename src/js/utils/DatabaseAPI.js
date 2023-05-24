import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function getCurrentDatabase() {
  return request({
    url: API_BASE_URL + "/database/current",
    method: 'GET'
  });
}

export function getDataServices() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/database/services",
    method: 'GET',
  })
}

export function getValidationModes() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/database/validation-modes",
    method: 'GET',
  })
}

export function getIndices() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/database/indices",
    method: 'GET',
  })
}
