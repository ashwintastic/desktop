import { SELECTED_EXPERIMENT_DTO } from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case SELECTED_EXPERIMENT_DTO:
      return action.payload;
    default:
      return state;
  }
}
