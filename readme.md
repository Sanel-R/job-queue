## Instructions to follow along.
- Create a folder
- execute:
- **Initialize your project**
   ```npm
    npm init -y 
   ```
- **Create a index.js file**
    ```npm
      New-Item index.js -type file
    ```
- **Tells the node to use module ECS**
    ```
       add: "type": "module",
    ```
- **Enables you use .ts when importing your modules**
   ```
        "noEmit": true,
        "allowImportingTsExtensions": true,
   ```
- **To open markdown just click ctrl + shift + v**
- **Added native testing**
   ```
      npm install --save-dev @types/node
      npm install --save-dev ts-node
   ```
- **To ensure that NODE_OPTIONS="--loader ts-node/esm node ..." is executed, add cross platform support"**
   ```
      npm install --save-dev cross-env
   ```
- **Test executions**
   ```
      npm test
   ```

## Project Structure
example/
  ├ …
  ├ src/
    ├ app/…
    └ sw/…
  └ test/
    ├ globals/
      ├ …
      ├ IndexedDb.js
      └ ServiceWorkerGlobalScope.js
    ├ setup.mjs
    ├ setup.units.mjs
    └ setup.ui.mjs
