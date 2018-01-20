import { ipcRenderer } from 'electron';
import { RECENT_EXPERIMENTS_FETCHED, SELECTED_EXPERIMENT_DTO } from '../constants';

export function fetchRecentExperiments(n) {
  // TODO:z Can be parameterized for dates, page no.
  ipcRenderer.send('fetch-recent-experiments', n);

  return dispatch => {
    ipcRenderer.once('recent-experiments', (event, experiments) => {
      dispatch(fetchedRecentExperiments(experiments));
    });
  };
}

export function saveSelectedExperimentDTO(selectedExperimentDTO) {
  return {
    type: SELECTED_EXPERIMENT_DTO,
    payload: selectedExperimentDTO
  };
}

function fetchedRecentExperiments(recentExperiments) {
  return {
    type: RECENT_EXPERIMENTS_FETCHED,
    payload: recentExperiments
  };
}
