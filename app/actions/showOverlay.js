export default function showOverLay(flag, data = {}){
  return {
    type: 'SHOW_OVER_LAY',
    payload: {flag, data}
  }
}
