import { RECENT_EXPERIMENTS_FETCHED } from '../constants';

export default function recentExperiments(state = {}, action) {
  switch (action.type) {
    case RECENT_EXPERIMENTS_FETCHED:
      return action.payload;
    default:
      return state;
  }
}
