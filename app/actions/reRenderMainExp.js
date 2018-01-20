import { RERENDER_MAIN_EXP } from '../constants';

export default function rerenderMainExp(plateName) {
  return {
    type: RERENDER_MAIN_EXP,
    payload: 0
  };
}
