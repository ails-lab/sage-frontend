import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function getElastics() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/elastics/get-all",
    method: 'GET',
  })
}

export function getElasticInfo(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/elastics/get-info/" + id,
    method: 'GET',
  })
}
