//------------------------------------------------------------------------------
import Deque from 'double-ended-queue';
import disp, { store } from './store';
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
let batchJob;
//------------------------------------------------------------------------------
export function sfetch(opts, success, fail, start) {
  if (opts.method === undefined)
    opts.method = 'GET';

  if (opts.credentials === undefined)
    opts.credentials = 'omit';

  if (opts.mode === undefined)
    opts.mode = 'cors';

  if (opts.cache === undefined)
    opts.cache = 'default';

  if (opts.method === 'PUT' && opts.r !== undefined )
    opts.body = JSON.stringify(opts.r);

  let authData;

  if( !opts.noauth ) {
    // send auth data
    // antipattern, but only as an exception and it is the fastest method
    const auth = store.getState().getIn([], 'auth');

    if (auth && auth.authorized) {
      const headers = opts.headers ? opts.headers : new Headers();
      authData = auth.uuid + ', ' + auth.hash;

      if (auth.token)
        authData += ', ' + auth.token;

      headers.append('X-Access-Data', authData);
      opts.headers = headers;
    }

    // need for caching authorized request separate from regular not authorized
    if (opts.r && auth) {
      if (opts.a === true && auth.authorized)
        opts.r.a = true;
      else if (opts.a === '' && auth.uuid)
        opts.r.a = auth.uuid;

      if (auth.employee) {
        if (opts.e === true)
          opts.r.e = true;
        else if (opts.e === '' && auth.employee)
          opts.r.e = auth.employee;
      }
    }
  }

  let url = BACKEND_URL;

  if( opts.method === 'GET' && opts.r !== undefined )
    url += '?' + serializeURIParams({ r: opts.r });

  if( opts.batch ) {
    const b = {...opts};
    delete b.batch;
    batchJob(b, (bOpts, bSuccess, bFail) => {
      sfetch(bOpts,
        result => bSuccess() && success(),
        error => bFail() && fail(),
        sOpts => start(sOpts));
    });
    return;
  }

  start && start.constructor === Function && start(opts);

  return fetch(url, opts).then(response => {
    const contentType = response.headers.get('content-type');

    if (authData) {
      // check if access token refreshed
      let xAccessToken = response.headers.get('X-Access-Token');
      let xAccessTokenTimestamp;
      if (xAccessToken) {
        [xAccessToken, xAccessTokenTimestamp] = xAccessToken.split(',');
        xAccessToken = xAccessToken.trim();
        xAccessTokenTimestamp = ~~xAccessTokenTimestamp.trim();
      }
      // antipattern, but only as an exception and it is the fastest method
      //const state = store.getState();

      disp(state => {
        if (xAccessToken) {
          if (xAccessToken !== state.getIn('auth', 'token')
            || xAccessTokenTimestamp > state.getIn('auth', 'timestamp'))
            state = state.editIn([], 'auth', v => {
              v.token = xAccessToken;
              v.timestamp = xAccessTokenTimestamp;
            });
        }
        else
          state = state.editIn([], 'auth', v => { delete v.token; delete v.timestamp; });

        return state;
      });
    }

    if (contentType) {
      if (contentType.includes('application/json'))
        return response.json();
      if (contentType.includes('text/'))
        return response.text();
      if (contentType.includes('image/') )
        return response.arrayBuffer();
    }
    // will be caught below
    throw new TypeError('Oops, we haven\'t right type of response! Status: '
      + response.status + ', ' + response.statusText + ', content-type: ' + contentType);
  }).then(result => {
    if (result === undefined || result === null ||
      (result.constructor !== Object && result.constructor !== Array && result.constructor !== ArrayBuffer))
      throw new TypeError('Oops, we haven\'t got data! ' + result);

    success && success.constructor === Function && success(result, opts);
  }).catch(error => {
    if (process.env.NODE_ENV === 'development')
      console.log(error);

    fail && fail.constructor === Function && fail(error, opts);
  });
}
//------------------------------------------------------------------------------
export function icoUrl(u, w, h, cs) {
  const r = { m: 'img', f: 'ico', u: u };
  if( w !== undefined )
    r.w = w;
  if( h !== undefined )
    r.h = h;
  if( cs !== undefined )
    r.cs = cs;
  return BACKEND_URL + '?' + serializeURIParams({r:r});
}
//------------------------------------------------------------------------------
export function imgUrl(u) {
  return BACKEND_URL + '?' + serializeURIParams({ r: { m: 'img', u: u } });
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class ZeroTimeout {
  static timeouts = new Deque([]);
  static messageName = 'zero-timeout-message';

  static messageHandler(e) {
    if (e.source === window && e.data === ZeroTimeout.messageName) {
      e.stopPropagation();
      if (!ZeroTimeout.timeouts.isEmpty())
        ZeroTimeout.timeouts.shift()();
    }
  }

  static initialize() {
    window.addEventListener('message', ZeroTimeout.messageHandler, true);
  }
}
//------------------------------------------------------------------------------
ZeroTimeout.initialize();
//------------------------------------------------------------------------------
function setZeroTimeout(fn) {
  ZeroTimeout.timeouts.push(fn);
  window.postMessage(ZeroTimeout.messageName, '*');
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class JobsQueue {
  static ldrs = new Deque([1, 1]);
  static reqs = new Deque([]);

  static end() {
    JobsQueue.ldrs.push(1);
    JobsQueue.queue();
    return true;
  }
  
  static queue() {
    for(;;) {
      const job = JobsQueue.reqs.shift();
  
      if (job === undefined)
        break;

      const ldr = JobsQueue.ldrs.shift();
      
      if (ldr === undefined) {
        JobsQueue.reqs.push(job);
        setZeroTimeout(JobsQueue.queue);
        break;
      }

      job.launcher(job.opts, JobsQueue.end,
        // eslint-disable-next-line
        () => {
          if( job.n !== 0 ) {
            job.n--;
            JobsQueue.reqs.push(job);
            return false;
          }
          return JobsQueue.end();
        }
      );
    }
  }
}
//------------------------------------------------------------------------------
batchJob = function (opts, launcher) {
  JobsQueue.reqs.push({
    opts: opts,
    launcher,
    n: 3
  });
  JobsQueue.queue();
}
//------------------------------------------------------------------------------
