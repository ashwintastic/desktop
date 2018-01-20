import { SELECTED_EXPERIMENT, SELECTED_EXPERIMENT_UPDATE } from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case SELECTED_EXPERIMENT:
      return action.payload; // Always overrides
    case SELECTED_EXPERIMENT_UPDATE:
      // Overrides only when same experiment id
      if (state.id !== undefined && state.id == action.payload.id) { return action.payload; }
      return state;
    default:
      return state;
  }
}
