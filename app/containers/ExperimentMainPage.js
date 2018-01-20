import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ExperimentMain from '../components/ExperimentMain';
import showOverLayAction from '../actions/showOverlay';
import { openSelectedExperiment,
         addExperimentInProcessQueue,
         addPlateInProcessQueue,
         getProcessUpdate } from '../actions/experimentMainAction';
import rerenderMainExp from '../actions/reRenderMainExp';

function mapStateToProps(state) {
  return {
    selectedExperimentDTO: state.selectedExperimentDTO,
    selectedExperiment: state.selectedExperiment,
    renderMainexp: state.renderMainexp,
    showOverLay: state.showOverLay
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ openSelectedExperiment,
    addExperimentInProcessQueue,
    addPlateInProcessQueue,
    rerenderMainExp,
    getProcessUpdate,
    showOverLayAction
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentMain);
