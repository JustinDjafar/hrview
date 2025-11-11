PS C:\Coding\hrview\frontend> docker compose ps
NAME               IMAGE            COMMAND                  SERVICE   CREATED         STATUS         PORTS
hrview-backend-1   hrview-backend   "uvicorn main:app --…"   backend   6 minutes ago   Up 6 minutes   0.0.0.0:8000->8000/tcp
PS C:\Coding\hrview\frontend> docker compose logs frontend
hrview-frontend-1  |
hrview-frontend-1  | > client@0.0.0 dev
hrview-frontend-1  | > ROLLUP_NO_NATIVE=1 vite
hrview-frontend-1  |
hrview-frontend-1  | /app/node_modules/rollup/dist/native.js:83
hrview-frontend-1  |            throw new Error(
hrview-frontend-1  |                  ^
hrview-frontend-1  |
hrview-frontend-1  | Error: Cannot find module @rollup/rollup-linux-x64-gnu. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
hrview-frontend-1  |     at requireWithFriendlyError (/app/node_modules/rollup/dist/native.js:83:9)
hrview-frontend-1  |     at Object.<anonymous> (/app/node_modules/rollup/dist/native.js:92:76)
hrview-frontend-1  |     ... 3 lines matching cause stack trace ...
hrview-frontend-1  |     at Module._load (node:internal/modules/cjs/loader:1091:12)
hrview-frontend-1  |     at cjsLoader (node:internal/modules/esm/translators:298:15)
hrview-frontend-1  |     at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:240:7)
hrview-frontend-1  |     at ModuleJob.run (node:internal/modules/esm/module_job:325:25)
hrview-frontend-1  |     at async ModuleLoader.import (node:internal/modules/esm/loader:606:24) {
hrview-frontend-1  |   [cause]: Error: Cannot find module '@rollup/rollup-linux-x64-gnu'
hrview-frontend-1  |   Require stack:
hrview-frontend-1  |   - /app/node_modules/rollup/dist/native.js
hrview-frontend-1  |       at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
hrview-frontend-1  |       at Module._load (node:internal/modules/cjs/loader:1038:27)
hrview-frontend-1  |       at Module.require (node:internal/modules/cjs/loader:1289:19)
hrview-frontend-1  |       at require (node:internal/modules/helpers:182:18)
hrview-frontend-1  |       at requireWithFriendlyError (/app/node_modules/rollup/dist/native.js:65:10)
hrview-frontend-1  |       at Object.<anonymous> (/app/node_modules/rollup/dist/native.js:92:76)
hrview-frontend-1  |       at Module._compile (node:internal/modules/cjs/loader:1521:14)
hrview-frontend-1  |       at Module._extensions..js (node:internal/modules/cjs/loader:1623:10)
hrview-frontend-1  |       at Module.load (node:internal/modules/cjs/loader:1266:32)
hrview-frontend-1  |       at Module._load (node:internal/modules/cjs/loader:1091:12) {
hrview-frontend-1  |     code: 'MODULE_NOT_FOUND',
hrview-frontend-1  |     requireStack: [ '/app/node_modules/rollup/dist/native.js' ]
hrview-frontend-1  |   }
hrview-frontend-1  | }
hrview-frontend-1  |
hrview-frontend-1  | Node.js v20.19.5
PS C:\Coding\hrview\frontend>