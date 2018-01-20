const path = require('path');

/**
* Cytena App Version: major.algo.client
* - Algo version is used for storing processes.
* - Client version reserved for only UI updates which doesnt effect process results.
*/
class ProjectVersion {
/**
 * @return {string} The current version of the package.
 */
  getVersion() {
    let version = process.env.npm_package_version;

    if (version === undefined || version === null) {
      version = '0.1.0'; // TODO: pick version from application config.
    }

    return version;
  }

/**
 * @return The current algo version of the package.
 */
  getAlgoVersion() {
    const version = this.getVersion();
    return version.replace('v', '').substr(0, 3);
  }
}

export default new ProjectVersion();
