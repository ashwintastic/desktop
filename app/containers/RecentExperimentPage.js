import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RecentExperiment from '../components/RecentExperiment';
import { fetchRecentExperiments, saveSelectedExperimentDTO } from '../actions/homeAction';

function mapStateToProps(state) {
  return {
    recentExperiments: state.recentExperiments
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchRecentExperiments, saveSelectedExperimentDTO }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RecentExperiment);
