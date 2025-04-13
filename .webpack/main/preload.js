/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!************************!*\
  !*** ./src/preload.ts ***!
  \************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const electron_1 = __webpack_require__(/*! electron */ "electron");
// Expose APIs from Electron to the renderer process
electron_1.contextBridge.exposeInMainWorld('electron', {
    // File scanning
    startScan: (directoryPath) => electron_1.ipcRenderer.invoke('start-scan', directoryPath),
    getScanProgress: (callback) => {
        const subscription = (_event, progress) => callback(progress);
        electron_1.ipcRenderer.on('scan-progress', subscription);
        const unsubscribe = () => {
            electron_1.ipcRenderer.removeListener('scan-progress', subscription);
        };
        return unsubscribe;
    },
    // File organization
    organizeFiles: (files) => electron_1.ipcRenderer.invoke('organize-files', files),
    undoLastMove: () => electron_1.ipcRenderer.invoke('undo-last-move'),
    getHistory: () => electron_1.ipcRenderer.invoke('get-history'),
    // File system operations
    selectDirectory: () => electron_1.ipcRenderer.invoke('select-directory'),
    getFileStats: (path) => electron_1.ipcRenderer.invoke('get-file-stats', path),
    // Settings management
    saveSettings: (settings) => electron_1.ipcRenderer.invoke('save-settings', settings),
    getSettings: () => electron_1.ipcRenderer.invoke('get-settings'),
    // App info
    getAppVersion: () => electron_1.ipcRenderer.invoke('get-app-version'),
});

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=preload.js.map