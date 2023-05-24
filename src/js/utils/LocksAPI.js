import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function removeValidationPageLock(pavId, mode, page) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/locks/remove?pavId=" + pavId + "&mode=" + mode + "&page=" + page,
    method: 'POST',
  });
}
