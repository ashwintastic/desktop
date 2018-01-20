import { REPORT_FETCHED } from '../constants';

export default function report(state = {}, action) {
  switch (action.type) {
    case REPORT_FETCHED:
      return action.payload;
    default:
      return state;
  }
}
