import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function getTripleStores() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/triple-stores/get-all",
    method: 'GET',
  })
}

export function getTripleStoreInfo(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/triple-stores/get-info/" + id,
    method: 'GET',
  })
}
