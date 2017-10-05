//const BACKEND_URL = 'http://31.210.212.158:65480/opt-ws/hs/react';
// see proxy config in package.json
const pubUrl = process && process.env && process.env.PUBLIC_URL && process.env.PUBLIC_URL.constructor === String ? process.env.PUBLIC_URL : '';
const BACKEND_URL = pubUrl + '/api/backend';
export default BACKEND_URL;