import ProjectVersion from '../helper/projectVersion';
import { PROCESS_STATUS } from '../config/enums';

const APP_VERSION_ALGO = ProjectVersion.getAlgoVersion();

class ProcessUtil {

  evalExperimentStatus(dataset) {
    // isAllProcessCompleted ?
      // isAll success? YES NO
      // All failed

    // is any of them in queue
    // is any of them in IN_PROGRESS

    const totalPlates = dataset.plates.length;

    let experimentStatus = PROCESS_STATUS.PARTIAL_COMPLETED;
    let isUnprocessed = false;
    let isFailed = false;
    let isCompleted = false;
    let isOldVersion = false;

    const plateStatuses = {};

    for (let i = 0; i < totalPlates; i += 1) {
      const processes = dataset.plates[i].processes;

      if (processes != null && processes != undefined && processes.length > 0) {
        if (processes[0].appVersionAlgo < APP_VERSION_ALGO) {
          isOldVersion = true;
        }
        if (plateStatuses[processes[0].processStatus] != null) {
          plateStatuses[processes[0].processStatus] += 1;
        } else {
          plateStatuses[processes[0].processStatus] = 1;
        }
      } else {
        isUnprocessed = true;
      }
    }

    if (Object.keys(plateStatuses).length > 0) {
      if (plateStatuses[PROCESS_STATUS.IN_PROGRESS.id] != null) {
        experimentStatus = PROCESS_STATUS.IN_PROGRESS;
      } else if (plateStatuses[PROCESS_STATUS.QUEUED.id] != null) {
        experimentStatus = PROCESS_STATUS.QUEUED;
      }

      if (plateStatuses[PROCESS_STATUS.FAILED.id] != null) {
        if (plateStatuses[PROCESS_STATUS.FAILED.id] == totalPlates) {
          experimentStatus = PROCESS_STATUS.FAILED;
        }
        isFailed = true;
      }

      if (plateStatuses[PROCESS_STATUS.COMPLETED.id] != null) {
        if (plateStatuses[PROCESS_STATUS.COMPLETED.id] == totalPlates) {
          experimentStatus = PROCESS_STATUS.COMPLETED;
        }
        isCompleted = true;
      }
    } else {
      experimentStatus = PROCESS_STATUS.OPENED;
    }

    return { experimentStatus, isUnprocessed, isFailed, isCompleted, isOldVersion };
  }

  evalPlateStatus(plate) {
    const isUnprocessed = (plate.processes === null || plate.processes === undefined
                            || plate.processes.length == 0);
    const canReProcess = (!isUnprocessed) && (plate.processes[0].appVersionAlgo < APP_VERSION_ALGO
                            || plate.processes[0].processStatus == PROCESS_STATUS.FAILED.id);

    return { isUnprocessed, canReProcess };
  }
}

export default new ProcessUtil();
