//------------------------------------------------------------------------------
import { store } from './store';
//------------------------------------------------------------------------------
// node_modules\react-scripts\config\webpack.config.prod.js
// new SWPrecacheWebpackPlugin({
// runtimeCaching: [{
//     urlPattern: /^(.*)$/,
//     handler: 'networkFirst'
//   }, {
//   urlPattern: /\/articles\//,
//   handler: 'fastest',
//   options: {
//     cache: {
//       maxEntries: 10,
//       name: 'articles-cache'
//     }
//   }
// }],
// verbose: true
//------------------------------------------------------------------------------
// nginx proxy configuration
// location ~ ^/reorders/api/backend {
//     rewrite ^/reorders/api/backend(.*)$ /opt-ws/hs/react$1$is_args$args break;
//     proxy_pass http://31.210.212.158:65480;
//     proxy_set_header Host $host;
//     proxy_http_version 1.1;
//     proxy_read_timeout 120s;
//     proxy_redirect off;
//     proxy_set_header Upgrade $http_upgrade;
//     proxy_set_header Connection "upgrade";
//     proxy_cache_bypass $http_upgrade;
//     add_header 'Service-Worker-Allowed' '/';
// }

// location ~ ^/reorders {
//     rewrite ^/reorders(.*)$ /$1$is_args$args break;
//     proxy_pass http://baza.shintorg48.ru:5000;
//     proxy_set_header Host $host;
//     proxy_http_version 1.1;
//     proxy_read_timeout 120s;
//     proxy_redirect off;
//     proxy_set_header Upgrade $http_upgrade;
//     proxy_set_header Connection "upgrade";
//     proxy_cache_bypass $http_upgrade;
//     add_header 'Service-Worker-Allowed' '/';
// }
//------------------------------------------------------------------------------
export function transform(data, keyField) {
  if (Array.isArray(data)) {
    for (let i = data.length - 1; i >= 0; i--)
      data[i] = transform(data[i], keyField);
    return data;
  }

  const { cols, dict, text, boolean } = data;

  for (const k of ['rows', 'grps']) {
    const recs = data[k];

    if (recs === undefined)
      continue;

    const rmap = {};

    for (let i = recs.length - 1; i >= 0; i--) {
      const row = recs[i];
      const now = { /*lineNo : i + 1*/ };

      for (let j = cols.length - 1; j >= 0; j--) {
        const v = row[j];

        if (v !== null) {
          const n = cols[j];
          now[n] = text[n] ? dict[v] : (boolean[n] ? v !== 0 : v);
        }
      }
      recs[i] = now;

      if (keyField !== undefined && keyField !== null)
        rmap[now[keyField]] = now;
    }

    if (keyField !== undefined && keyField !== null)
      data[k + 'Map'] = rmap;
  }

  return data;
}
//------------------------------------------------------------------------------
function encode(val) {
  return encodeURIComponent(val)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    //.replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']');
}
//------------------------------------------------------------------------------
function parseValue(k, v) {
  if (v.constructor === Date)
    v = v.toISOString();
  else if (v.constructor === Object)
    v = JSON.stringify(v);
  return encode(k) + '=' + encode(v);
}
//------------------------------------------------------------------------------
export function serializeURIParams(params) {
  let parts = [];

  for (let key in params) {
    let val = params[key];

    if (val === null || typeof val === 'undefined')
      continue;

    if (val.constructor === Array)
      key += '[]';

    if (val.constructor !== Array)
      val = [val];

    for (let v of val)
      parts.push(parseValue(key, v));
  }

  return parts;
}
//------------------------------------------------------------------------------
// see proxy config in package.json
const pubUrl = process && process.env && process.env.PUBLIC_URL
  && process.env.PUBLIC_URL.constructor === String ? process.env.PUBLIC_URL : '';
const BACKEND_URL = pubUrl + '/api/backend';
//------------------------------------------------------------------------------
export default BACKEND_URL;
//------------------------------------------------------------------------------
export function sfetch(opts, success, fail) {
  if (opts.method === undefined )
    opts.method = 'GET';

  if (opts.credentials === undefined )
    opts.credentials = 'omit';

  if (opts.mode === undefined )
    opts.mode = 'cors';

  if (opts.cache === undefined )
    opts.cache = 'default';

  if (opts.method === 'PUT')
    opts.body = JSON.stringify(opts.r);

  // send auth data
  // antipattern, but only as an exception and it is the fastest method
  const auth = store.getState().getIn([], 'auth');

  if( auth && auth.uuid && auth.hash && auth.token ) {
    const headers = opts.headers ? opts.headers : new Headers();
    headers.append('X-Access-Data', auth.uuid + ', ' + auth.hash + ', ' + auth.token);
    opts.headers = headers;
  }

  const url = BACKEND_URL + (opts.method === 'GET'
    ? '?' + serializeURIParams({ r: opts.r }) : '');

  return fetch(url, opts).then(response => {
    const contentType = response.headers.get('content-type');

    // check if access token refreshed
    const xAccessToken = response.headers.get('X-Access-Token');
    // antipattern, but only as an exception and it is the fastest method
    xAccessToken && store.getState().setIn('auth', 'token', xAccessToken, 0);

    if( contentType ) {
      if( contentType.includes('application/json') )
        return response.json();
      if( contentType.includes('text/') )
        return response.text();
    }
    // will be caught below
    throw new TypeError('Oops, we haven\'t right type of response! Status: ' + response.status + ', ' + response.statusText);
  }).then(json => {
    if( json === undefined || json === null || (json.constructor !== Object && json.constructor !== Array) )
      throw new TypeError('Oops, we haven\'t got JSON!' + (json && json.constructor === String ? ' ' + json : ''));

    success && success.constructor === Function && success(json);
  }).catch(error => {
    if( process.env.NODE_ENV === 'development' )
      console.log(error);
    
    fail && fail.constructor === Function && fail(error);
  });
}
//------------------------------------------------------------------------------
export function icoUrl(u, w, h) {
  return BACKEND_URL + '?'
    + serializeURIParams({r: {m: 'img', f: 'ico', u: u, w: w, h: w}});
}
//------------------------------------------------------------------------------
export function imgUrl(u) {
  return BACKEND_URL + '?' + serializeURIParams({r: {m: 'img', u: u}});
}
//------------------------------------------------------------------------------
