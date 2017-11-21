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
