/**
 * Add event listeners and broacasters... for server-client interface
 */
import { BrowserWindow, ipcMain } from 'electron';
import ProjectVersion from './helper/projectVersion';
import { PROCESS_STATUS } from './config/enums';

const APP_VERSION_ALGO = ProjectVersion.getAlgoVersion();
const path = require('path');
const spawn = require('child_process').spawn;
const { download } = require('electron-dl');

const models = require('./db/syncDB.js');

global.isAlgoRunning = false;
global.algoProcess = null;
const logger = global.logger;

/**
* Check if cytenaAlgo process is already running
* If not start cytenaAlgo
*/
ipcMain.on('run-cytena-algo', (event) => {
  // Check if algo process is already running.
  // if not run a new process.
  if (global.isAlgoRunning == false) {
    global.isAlgoRunning = true;

    global.algoProcess = spawn('cytena.exe', { // TODO:z add os specific commands.
      cwd: path.resolve(__dirname, './algo/'),
      windowsHide: true // TODO:z works only in windows.
    });

    global.algoProcess.stdout.on('data', (data) => { // Gets the response from process
      logger.info(data.toString());
    });

    global.algoProcess.stderr.on('data', (data) => { // Gets all errors in log
      logger.error(data.toString());
    });

    global.algoProcess.on('error', (err) => {
      global.isAlgoRunning = false;
      global.algoProcess = null;
      logger.error('Failed to start algo process.', err);
    });

    global.algoProcess.stdout.on('message', (data) => {
      // TODO:y Instead of polling for data.
      // this can be used for updating data in store.
      // Or a global variable which can be read by polling method.
      logger.info(data.toString());
    });

    global.algoProcess.on('exit', (code) => {
      global.isAlgoRunning = false;
      global.algoProcess = null;

      if (code == null || code == 0) {
        logger.info(`Algo process exited with code ${code}`);
      } else { // Error
        logger.error(`Algo process exited with code ${code}`);
      }
    });
  }
});

// DAO interface methods
ipcMain.on('handle-interrupted-processes', (event) => {
  // Check if algo process is not running.
  // IF NOT: Get all processes inPROGRESS processes
  // and mark them as failed with reason... from CLIENT.
  if (global.isAlgoRunning === false) {
    // UPDATE all IN_PROGRESS processes as FAILED.
    models.Process.update({ processStatus: PROCESS_STATUS.FAILED.id },
      { where: { processStatus: {
        [models.conn.Op.in]: [PROCESS_STATUS.IN_PROGRESS.id, PROCESS_STATUS.QUEUED.id]
      } } }
    );
  }
});

ipcMain.on('fetch-recent-experiments', (event, n) => {
  models.Experiment.findAll({
    order: models.conn.literal('Experiment.created_at DESC, `plates->processes`.`app_version_algo` DESC, `plates->processes`.`id` DESC'),
    where: models.conn.literal(`Experiment.id IN (SELECT id from Experiment as ie order by ie.created_at DESC limit ${n})`),
    include: [{
      model: models.Plate,
      as: 'plates',
      include: [{
        model: models.Process,
        as: 'processes'
      }]
    }]
  }).then(experiments => {
    let experimentsDTO = [];
    if (experiments != null && experiments.length > 0) {
      experimentsDTO = JSON.parse(JSON.stringify(experiments));
    }

    event.sender.send('recent-experiments', experimentsDTO);
    return true;
  }).catch(err => {
    logger.error('Error getting experiments:', err);
    return false;
  });
});

ipcMain.on('fetch-experiment-by-path', (event, experimentPath) => {
  models.Experiment.findAll({
    where: { folderPath: experimentPath },
    order: models.conn.literal('Experiment.created_at DESC, plates.name DESC, `plates->processes`.`app_version_algo` DESC, `plates->processes`.`id` DESC, `plates->processes->processReports`.`sample_name` ASC'),
    include: [{
      model: models.Plate,
      as: 'plates',
      include: [{
        model: models.Process,
        as: 'processes',
        include: [{
          model: models.ProcessReport,
          as: 'processReports'
        }]
      }]
    }]
  }).then(experiments => {
    let experimentDTO = null;
    if (experiments != null && experiments.length > 0) {
      experimentDTO = JSON.parse(JSON.stringify(experiments[0]));
    }

    event.sender.send('selected-experiment', experimentDTO);
    return true;
  }).catch(err => {
    logger.error('Error getting experiment by path:', err);
    return false;
  });
});

ipcMain.on('save-experiment', (event, experiment) => {
  models.Experiment.create(experiment,
    {
      include: [{
        association: models.Experiment.Plates
      }]
    }).then(savedExperiment => {
      let experimentDTO = null;

      if (savedExperiment != null) {
        experimentDTO = JSON.parse(JSON.stringify(savedExperiment));
      }

      event.sender.send('saved-experiment', experimentDTO);
      return true;
    }).catch(err => {
      logger.error('Error saving experiment:', err);
      return false;
    });
});

// TODO:x Check if we can make this as a asyc call. with method queue
// TODO:y process should be created in order of plates created in case of processAll.
ipcMain.on('add-in-process-queue', (event, plateIds) => {
  // Create process if not already created for the provided plateId and current appVersionAlgo
  const response = {};

  const processes = plateIds.map(plateId => {
    const plateProcess = {};
    plateProcess.plate_id = plateId;
    plateProcess.appVersionAlgo = APP_VERSION_ALGO;
    plateProcess.processStatus = PROCESS_STATUS.QUEUED.id;
    return plateProcess;
  });

  models.Process.bulkCreate(processes).then(() => models.Process.findAll({
    where: {
      plate_id: {
        [models.conn.Op.in]: plateIds
      },
      appVersionAlgo: APP_VERSION_ALGO
    }
  })).then(savedProcesses => {
    event.returnValue = getResponseDTO(true, null, savedProcesses);
    return null;
  }).catch(err => {
    logger.error('Error adding plates to queue:', err);
    event.returnValue = getResponseDTO(false, 'Some error while adding plates to processing Queue', null);
    return null;
  });
});

ipcMain.on('update-sample-result', (event, processId, sampleName, overrideValue, overrideComment) => {
  models.ProcessReport.update({ overrideValue, overrideComment },
    { where: { process_id: processId, sampleName } }
  ).then(() => {
    event.returnValue = getResponseDTO(true, 'Sample result updated', null);
    return null;
  }).catch(err => {
    logger.error('Error updating sample result:', err);
    event.returnValue = getResponseDTO(false, 'Some error occured while updating sample result.', null);
    return null;
  });
});

ipcMain.on('update-experiment-path', (event, experimentId, folderPath) => {
  models.Experiment.update({ folderPath },
    { where: { id: experimentId } }
  ).then(() => {
    event.returnValue = getResponseDTO(true, 'Experiment path updated', null);
    return null;
  }).catch(err => {
    logger.error('Error updating experiment path:', err);
    event.returnValue = getResponseDTO(false, 'Some error occured while updating experiment path.', null);
    return null;
  });
});

ipcMain.on('download-report', (event, selectedExperiment) => {
// Call python method for generating report for an experimentId.

  const reportProcess = spawn('cytena.exe', [`-e ${selectedExperiment.id}`], { // TODO:z add os specific commands.
    cwd: path.resolve(__dirname, './algo/'),
    windowsHide: true // TODO:z works only in windows.
  });

  reportProcess.stdout.on('data', (data) => { // Gets the response from process
    const response = JSON.parse(data.toString());

    if (response.success == true) {
    // read file from system.
    // download to user.
      const reportPath = response.data;

      download(BrowserWindow.getFocusedWindow(), reportPath).then(dl => {
        event.sender.send('report-downloaded', getResponseDTO(true, 'Report downloaded', { name: dl.getFilename(), path: dl.getSavePath() }));
      }).catch(err => {
        logger.error(`ERROR: Downloading report: ${reportName}`, err);
      });
    } else {
      logger.error(response.message);
      event.sender.send('report-downloaded', getResponseDTO(false, 'Some error has occured in report generation.', null));
    }
  });

  reportProcess.stderr.on('data', (data) => { // Gets all errors in log
    logger.error(data.toString());
  });

  reportProcess.on('error', (err) => {
    logger.error('Failed to start algo process.', err);
    event.sender.send('report-downloaded', getResponseDTO(false, 'Some error has occured in report generation.', null));
  });

  reportProcess.on('exit', (code) => {
    if (code == null || code == 0) {
      logger.info(`Algo process exited with code ${code}`);
    } else { // Error
      logger.error(`Algo process exited with code ${code}`);
      event.sender.send('report-downloaded', getResponseDTO(false, 'Some error has occured in report generation.', null));
    }
  });
});

function getResponseDTO(success, message, data) {
  if (data != null) {
    data = JSON.parse(JSON.stringify(data));
  }

  return { success, message, data };
}

require('./db/testData.js');
