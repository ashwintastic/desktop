// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import report from './reportReducer';
import recentExperiments from './recentExperimentsReducer';
import selectedExperimentDTO from './selectedExperimentDTO';
import selectedExperiment from './selectedExperiment';
import renderMainexp from './rerenderMainExp';
import showOverLay from './showOverLay';

const rootReducer = combineReducers({
  report,
  recentExperiments,
  selectedExperimentDTO,
  selectedExperiment,
  renderMainexp,
  router,
  showOverLay
});

export default rootReducer;
