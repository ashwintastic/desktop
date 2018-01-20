// @flow
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import styles from './Branding.css';
import { REDIRECT_FROM_LANDING_PAGE_TIME } from '../constants';
import HomePage from '../containers/HomePage';

export default class BrandingComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectAfterSomeTime: false
    };
  }

  componentDidMount() {
    // Handle interrupted processes.
    ipcRenderer.send('handle-interrupted-processes');

	// TODO:y Do other maintainence tasks.
    // eg. delete temp/old files, backup/archive db

    setTimeout(() => {
      this.setState({ redirectAfterSomeTime: true });
    }, REDIRECT_FROM_LANDING_PAGE_TIME);
  }

  render() {
    const { redirectAfterSomeTime } = this.state;

    return (
      <div>
        {!redirectAfterSomeTime ?
        (<div className="img-responsive" data-tid="container">
          <img className={`${styles.branding} img-responsive center-block`} alt="Cytena" src="./assets/logo.png" />
        </div>
      ) : (<HomePage />)}
      </div>
    );
  }
}
