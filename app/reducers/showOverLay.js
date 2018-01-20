

export default function (state = false, action) {
  switch (action.type) {
    case 'SHOW_OVER_LAY':
      return action.payload;
    default:
      return state;
  }
}
