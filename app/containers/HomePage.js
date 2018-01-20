import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Home from '../components/Home';
import saveGeneratedReport from '../actions/reportAction';
import { fetchRecentExperiments, saveExperiment, saveSelectedExperimentDTO } from '../actions/homeAction';

function mapStateToProps(state) {
  return {
    counter: state.counter,
    report: state.report,
    recentExperiments: state.recentExperiments
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchRecentExperiments,
    saveExperiment,
    saveGeneratedReport,
    saveSelectedExperimentDTO
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
