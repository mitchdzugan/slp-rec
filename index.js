import xdgAppPaths from 'xdg-app-paths';
const config = xdgAppPaths.config();
const data = xdgAppPaths.data();
console.log({ config, data })
