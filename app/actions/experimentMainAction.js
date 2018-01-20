import { ipcRenderer } from 'electron';
import ProcessUtil from '../helper/processUtil';

import { SELECTED_EXPERIMENT, SELECTED_EXPERIMENT_UPDATE } from '../constants';

const logger = require('electron').remote.getGlobal('logger');

/**
* Read folder structure & DB for provided experimentPath
* If experiment exist. Merge create new found plates if any.
* If not create new experiment with plates.
* Save experimentDTO in redux as selectedExperiment.
*
* Return experimentDTO
*
*/
export function openSelectedExperiment(experimentDTO) {
  if (experimentDTO == null || experimentDTO.folderPath == null) {
    logger.error('Cannot open empty experiment.');
    return null;
  }

  // Read db for experiment with all plates and their result by appVersionAlgo
  ipcRenderer.send('fetch-experiment-by-path', experimentDTO.folderPath);

  return dispatch => {
    ipcRenderer.once('selected-experiment', (event, experiment) => {
      if (experiment == null || experiment.length <= 0) {
       // if experiment is new create new experiment in db.
        ipcRenderer.send('save-experiment', experimentDTO);
        ipcRenderer.once('saved-experiment', (event, savedExperiment) => {
          dispatch(reduxDispatch(SELECTED_EXPERIMENT, savedExperiment));
        });
      } else {
        // TODO:y CHECK if new plates added in dataset folder, IF yes then create new plates
        dispatch(reduxDispatch(SELECTED_EXPERIMENT, experiment));
      }
    });
  };
}

export function addExperimentInProcessQueue(selectedExperiment) {
  return addPlatesInProcessQueue(selectedExperiment, selectedExperiment.plates.filter(plate => {
    const plateEval = ProcessUtil.evalPlateStatus(plate);
    return (plateEval.isUnprocessed || plateEval.canReProcess);
  }).map(plate => plate.id));
}

export function addPlateInProcessQueue(selectedExperiment, plateId) {
    // Verify if the plate is already under process or processed.
  return addPlatesInProcessQueue(selectedExperiment, selectedExperiment.plates.filter(plate => {
    const plateEval = ProcessUtil.evalPlateStatus(plate);
    return (plate.id == plateId && (plateEval.isUnprocessed || plateEval.canReProcess));
  }).map(plate => plate.id));
}

/**
*
* Add plates in process QUEUE for current version.
* Check if algo process is running.
* If no ping algo to startup.
*
* Return response
*/
function addPlatesInProcessQueue(selectedExperiment, plateIds) {
  if (plateIds != null && plateIds.length > 0) {
  // Add plates in QUEUE
    const response = ipcRenderer.sendSync('add-in-process-queue', plateIds);

    if (response.success) {
      const newProcessByPlateId = response.data.reduce((result, item) => {
        result[item.plate_id] = item;
        return result;
      }, {});

      const updatedPlates = selectedExperiment.plates.map(plate => {
        const newProcess = newProcessByPlateId[plate.id];

        if (newProcess !== null && newProcess !== undefined) {
          if (plate.processes == null) {
            plate.processes = [];
          }

        // add new process at the begining of plate processes array.
          plate.processes.unshift(newProcess);
        }
        return plate;
      });

      selectedExperiment.plates = updatedPlates;
    }

    // Run cytena algo async
    ipcRenderer.send('run-cytena-algo');
  }

  // update store
  return reduxDispatch(SELECTED_EXPERIMENT_UPDATE, selectedExperiment);
}

/**
*
* Update store with latest selected experiment.
*
*/
export function getProcessUpdate(selectedExperiment) {
  // Read db for experiment with all plates and their result by appVersionAlgo
  ipcRenderer.send('fetch-experiment-by-path', selectedExperiment.folderPath);

  return dispatch => {
    ipcRenderer.once('selected-experiment', (event, experiment) => {
      dispatch(reduxDispatch(SELECTED_EXPERIMENT_UPDATE, experiment));
    });
  };
}

function reduxDispatch(type, payload) {
  return { type, payload };
}
