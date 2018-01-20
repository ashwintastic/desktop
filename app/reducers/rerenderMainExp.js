import { RERENDER_MAIN_EXP } from '../constants';

export default function (state = 0, action) {
  let newState = state;
  switch (action.type) {
    case 'RERENDER_MAIN_EXP':
      newState =  state + 1;
      return newState;
    default:
      return state;
  }
}

