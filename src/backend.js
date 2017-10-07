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
// see proxy config in package.json
const pubUrl = process && process.env && process.env.PUBLIC_URL
    && process.env.PUBLIC_URL.constructor === String ? process.env.PUBLIC_URL : '';
const BACKEND_URL = pubUrl + '/api/backend';
//------------------------------------------------------------------------------
export default BACKEND_URL;
//------------------------------------------------------------------------------
