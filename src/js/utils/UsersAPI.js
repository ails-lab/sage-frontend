import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function logout() {
  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/users/logout",
    method: 'POST'
  });
}

export function register(registerRequest) {
  return request({
    url: API_BASE_URL + "/users/create",
    method: 'POST',
    body: JSON.stringify(registerRequest)
  });
}

export function resetPassword(email) {
  return request({
    url: API_BASE_URL + "/users/resetPasswordRequest?email=" + email,
    method: 'POST',
  });
}

export function savePassword(newPassRequest) {
  return request({
    url: API_BASE_URL + "/users/savePassword",
    method: 'POST',
    body: JSON.stringify(newPassRequest)
  });
}

export function userFieldChanged(changeRequest) {
  return request({
    url: API_BASE_URL + "/users/me",
    method: 'PUT',
    body: JSON.stringify(changeRequest)
  });
}

export function getCurrentUser() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/users/me",
    method: 'GET'
  });
}

export function getUserDetails() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/users/get",
    method: 'GET'
  });
}


// export function getValidatorsOfEditor() {
//   if (!localStorage.getItem(ACCESS_TOKEN)) {
//     return Promise.reject("No access token set.");
//   }
//
//   return request({
//     url: API_BASE_URL + "/users/getValidatorsOfEditor",
//     method: 'GET',
//   });
// }

// export function removeValidator(id) {
//   if (!localStorage.getItem(ACCESS_TOKEN)) {
//     return Promise.reject("No access token set.");
//   }
//
//   return request({
//     url: API_BASE_URL + "/users/removeValidator?validatorId=" + id,
//     method: 'POST',
//   });
// }

// export function getEditorsOfValidator() {
//   if (!localStorage.getItem(ACCESS_TOKEN)) {
//     return Promise.reject("No access token set.");
//   }
//
//   return request({
//     url: API_BASE_URL + "/users/getEditorsOfValidator",
//     method: 'GET',
//   });
// }

// export function getPublicEditors() {
//   return request({
//     url: API_BASE_URL + "/users/getPublicEditors",
//     method: 'GET',
//   });
// }

// export function joinEditor(id) {
//   if (!localStorage.getItem(ACCESS_TOKEN)) {
//     return Promise.reject("No access token set.");
//   }
//   return request({
//     url: API_BASE_URL + "/users/joinEditor?editorId=" + id,
//     method: 'POST'
//   });
// }


export function getUsers() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/users/get-all",
    method: 'GET',
  })
}

export function getUserInfo(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/users/get-info/" + id,
    method: 'GET',
  })
}

export function updateUserRoles(id, newRoles) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/users/update-roles/" + id,
    body: JSON.stringify(newRoles),
    method: 'POST',
  })
}
