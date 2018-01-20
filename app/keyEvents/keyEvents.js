import Mousetrap from 'mousetrap';

const logger = require('electron').remote.getGlobal('logger');

class keyEvents {

  onKeyPress(key, cb, data = null) {
    Mousetrap.bind(key, (e) => {
      logger.debug('Additonal data if required', data);
      cb();
    });
  }

}
export default new keyEvents();
