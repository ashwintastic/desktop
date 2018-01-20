/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import MenuBuilder from './menu';

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const winston = require('winston');
require('winston-daily-rotate-file');

let logLevel = 'info';
let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
  logLevel = 'debug';
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(logger.info);
};

/**
* LOGGER CONFIG
*/
const logDir = path.resolve(os.homedir(), './.cytenaNerve/logs/client');
// Make sure the app output directory is there.
fs.ensureDirSync(logDir);

const consoleTransport = new (winston.transports.Console)({
  timestamp() {
    return Date.now();
  },
  formatter(options) {
    return `${options.timestamp()} ${
          winston.config.colorize(options.level, options.level.toUpperCase())} ${
          options.message ? options.message : ''
          }${options.meta && Object.keys(options.meta).length ? `\n\t${JSON.stringify(options.meta)}` : ''}`;
  }
});

const fileRotateTransport = new (winston.transports.DailyRotateFile)({
  filename: path.resolve(logDir, './app.log'),
  datePattern: 'yyyy-MM-dd.',
  prepend: true,
  level: logLevel,
  handleExceptions: true,
  humanReadableUnhandledException: true,
  zippedArchive: true,
  maxDays: 30,  // TODO:y can get these config from user settings.
  timestamp() {
    return Date.now();
  },
  formatter(options) {
    return `${options.timestamp()} ${
          winston.config.colorize(options.level, options.level.toUpperCase())} ${
          options.message ? options.message : ''
          }${options.meta && Object.keys(options.meta).length ? `\n\t${JSON.stringify(options.meta)}` : ''}`;
  }
});

// Creating logger global instance
const logger = new (winston.Logger)({
  level: logLevel,
  transports: [
    consoleTransport,
    fileRotateTransport
  ],

  exitOnError: false
});

global.logger = logger;
/* --------------------*/

/**
* including server-client interface methods.
*/
require('./interface.js');

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 1024,
    minHeight: 728,
    title: 'Cytena - single cells on demand',
    icon: `${__dirname}/assets/icon.ico`
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('close', (e) => {
    if (global.algoProcess != null) {
      e.preventDefault(); // Prevents the window from closing
      dialog.showMessageBox({
        type: 'warning',
        buttons: ['Quit', 'Cancel'],
        title: 'Cytena',
        noLink: true,
        message: 'A process is running! Are you sure you want to quit?',
        detail: 'All background processes will be stoped and marked as failed.'
      }, (response) => {
        if (response === 0) { // Runs the following if 'Yes' is clicked
          global.algoProcess.kill('SIGKILL');
          global.algoProcess = null;
          mainWindow.close();
        }
      });
    } else {
      logger.debug('################# APP CLOSED ###################');
      mainWindow = null;
    }
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();


  ipcMain.on('alert', (event, message) => {
    mainWindow.setOverlayIcon(`${__dirname}/assets/alert.png`, 'alert');
  });

  ipcMain.on('focus-window', (event) => {
    mainWindow.focus();
  });
});
