import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';

export const sRequest = (options) => {
  const headers = new Headers()

  if (localStorage.getItem(ACCESS_TOKEN)) {
    headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options)
};

export const sjRequest = (options) => {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })

  if (localStorage.getItem(ACCESS_TOKEN)) {
    headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options)
};

export const jsRequest = (options) => {
  const headers = new Headers()

  if (localStorage.getItem(ACCESS_TOKEN)) {
    headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options)
    .then(response =>
        response.ok ? response.json() : Promise.reject(response),
        () => Promise.reject()
    )
};


export const formSuccessFailureRequest = (options) => {
  // const headers = new Headers({
  //   'Content-Type': 'multipart/form-data',
  // })
  const headers = new Headers()

  if (localStorage.getItem(ACCESS_TOKEN)) {
    headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options)
    .then(response => {
      if (response.ok) {
        return response.json()
      } else {
       return (response.json().then(e => Promise.reject(e)))
     }
   },
      () => Promise.reject()
    )
};

export const mfRequest = (options) => {
  const headers = new Headers({
    'Content-Type': 'multipart/form-data',
  })

  if (localStorage.getItem(ACCESS_TOKEN)) {
    headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options)
    .then(response =>
      response.ok ? response.json() : Promise.reject(response),
      () => Promise.reject()
    )
};

export const jRequest = (options) => {
  return fetch(options.url, options)
    .then(response => {
      response.ok ? response.json() : Promise.reject(response)},
      () => Promise.reject()
    )
};

export const request = (options) => {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })

  if (localStorage.getItem(ACCESS_TOKEN)) {
    headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options)
    .then(response =>
      response.ok ? response.json() : Promise.reject(response),
      () => Promise.reject()
    )
};

export const jsonSuccessFailureRequest = (options) => {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })

  if (localStorage.getItem(ACCESS_TOKEN)) {
    headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options)
    .then(response => {
      if (response.ok) {
        return response.json()
      } else {
       return (response.json().then(e => Promise.reject(e)))
     }
   },
      () => Promise.reject()
    )
};

// export const acceptJsonErrorRequest = (options) => {
//   const headers = new Headers({
//     'Content-Type': 'application/json',
//   })
//
//   if (localStorage.getItem(ACCESS_TOKEN)) {
//     headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
//   }
//
//   const defaults = { headers: headers };
//   options = Object.assign({}, defaults, options);
//
//   return fetch(options.url, options)
//     .then(response => {
//       console.log(response);
//       return response.ok ? ( Object.getPrototypeOf(response).hasOwnProperty("json") ? response.json() : new Promise() )
//                   : Promise.reject( Object.getPrototypeOf(response).hasOwnProperty("json") ? response.json() : response )
// },
//       () => Promise.reject()
//     )
// };

export const jjrequest = (options) => {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })

  if (localStorage.getItem(ACCESS_TOKEN)) {
    headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options)
    .then(response =>
      response.ok ? response :
        () => Promise.reject()
    )
};

export const textrequest = (options) => {
  const headers = new Headers({
    'Content-Type': 'text/plain',
  })

  if (localStorage.getItem(ACCESS_TOKEN)) {
    headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options)
  // .then(response => {
  //   console.log("RESPONSE");
  //   console.log(response);
  //     response.text().then(text => {
  //         if(!response.ok) {
  //             return Promise.reject(text);
  //         }
  //         // console.log(text);
  //         return text;
  //     })}
  // );
};

export const textRequest = (options) => {
  const headers = new Headers({
    'Content-Type': 'text/plain',
  })

  if (localStorage.getItem(ACCESS_TOKEN)) {
    headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options)
};

export function signin(loginRequest) {
  return request({
    url: API_BASE_URL + "/auth/signin",
    method: 'POST',
    body: JSON.stringify(loginRequest)
  });
}


export function getDatasetSchemaClass(datasetUri, classUris) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  if (classUris) {
    var classes = [];
    for (var c of classUris) {
      classes.push(encodeURIComponent(c))
    }
    classes = classes.join(",")
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/f/datasets/schema-classes?datasetUri=" + datasetUri + (classes ? "&classUris=" + encodeURIComponent(classUris) : ""),
    method: 'GET'
  });
}



export function getOntologyQueryProperties() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/ontology/getQueryProperties",
    method: 'GET',
  })
}

export function resolveTime(text) {
  return jRequest({
    url: "https://apps.islab.ntua.gr/intime/api/date?text=" + text,
    method: 'GET',
  })
}

export function resolveSpace(text) {
  return jRequest({
    url: "https://apps.islab.ntua.gr/inplace/api/location?text=" + text,
    method: 'GET',
  })
}

export function resolveThesaurusTerm(text, index, vocabularies) {
  var vocs = [];
  if (vocabularies) {
    for (var i in vocabularies) {
      vocs.push(encodeURIComponent(vocabularies[i]))
    }
  }
  return jRequest({
    url: "https://apps.islab.ntua.gr/inknowledge/api/lookup?text=" + text + "&index=" + index + "&limit=10" + (vocs.length ? "&graphs=" + vocs.join() : ""),
    method: 'GET',
  })
}

export function labelResource(r) {
  return request({
    url: API_BASE_URL + "/f/resources/label?resource=" + encodeURIComponent(r),
    method: 'GET',
  })
}

export function insideTime(resource, vocabularies) {
  vocabularies = vocabularies.map(el => encodeURIComponent(el));
  var voc = "";
  if (vocabularies.length > 0) {
    voc = vocabularies.join(",");
  }

  return jRequest({
    url: "https://apps.islab.ntua.gr/intime/api/inside?resource=" + encodeURIComponent(resource) + "&vocabulary=" + voc,
    method: 'GET'
  })
}
