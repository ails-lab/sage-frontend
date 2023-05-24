export function splice(array, index) {
  return array.slice(0,index).concat(array.slice(index+1))
}

export function checkStatus (res) {
  if (res.status >= 200 && res.status < 300) {
    return res
  } else {
    let err = new Error(res.statusText)
    err.response = res
    throw err
  }
}


export function buildQueryString(params) {
  return Object.keys(params).map(key => key + '=' + params[key]).join('&');
}

export function copyReplaceAt(prop, array, index, object) {
  if (object !== null) {
    return { [prop]: array.slice(0, index)
                         .concat(object)
                         .concat(array.slice(index + 1)) }
   } else {
     return { [prop]: array.slice(0, index)
                          .concat(array.slice(index + 1)) }
   }
}

export function filterByLanguage(data, property, language) {

  if (!data[property]) {
    return null;
  }
  for (const item in data[property]) {
    if (data[property][item]['@language'] !== undefined && (data[property][item]['@language'] === language || data[property][item]['@language'].startsWith(language + '-'))) {
        return data[property][item]['@value'];
    }
  }

  for (const item in data[property]) {
    if (data[property][item]['@language'] !== undefined && (data[property][item]['@language'] === 'en' || data[property][item]['@language'].startsWith('en-'))) {
        return data[property][item]['@value'];
    }
  }

  return data[property][0]['@value'];
}

export function resolveJsonLdUri(str, context) {
  if (str.startsWith("_:") || str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }

  var pos = str.indexOf(':')
  var prefix;
  var suffix;
  if (pos !== -1) {
    prefix = str.slice(0, pos);
    suffix = str.slice(pos + 1);
  } else {
    prefix = str;
    suffix = '';
  }

  var cc = context[prefix];
  if (cc.hasOwnProperty('@id')) {
    return cc['@id'] + suffix;
  } else {
    return cc + suffix;
  }
}

export function objectToArray(obj) {
  if (Array.isArray(obj)) {
    return obj
  } else {
    return [ obj ]
  }
}

export function qname(uri) {
  if (uri.startsWith("http://www.w3.org/2005/xpath-functions/")) {
    return "xpath:" + uri.substring(39);
  } else if (uri.startsWith("http://sw.islab.ntua.gr/semaspace/ontology/")) {
    return "sema:" + uri.substring(43);
  } else if (uri.startsWith("http://islab.ntua.gr/ns/d2rml-op#")) {
    return "drop:" + uri.substring(33);
  }

  return uri;
}
