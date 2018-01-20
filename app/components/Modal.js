import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import {  EXPERIMENT_FOLDER_NOT_FOUND_ACTION } from '../constants/messages';
import styles from './Modal.css';
import { Link } from 'react-router-dom';
const customStyles = {
  content : {
    top                   : '178px',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    height                : '155px'
  }
};

export default class ModalUi extends React.Component {
  constructor() {
    super();
    this.state = {
      modalIsOpen:  true
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.

  }

  closeModal() {
    this.props.hideModal();
    this.setState({modalIsOpen: false});
  }

  continueBtn(){
    this.props.continueBtn()
  }

  render() {
    const {expInfo} = this.props;
    return (
        <div >
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Warning"
          ariaHideApp={false}
        >
          <button onClick={this.closeModal} className={"btn-link "+ styles.closeBtn}>close</button>
          <h4>{EXPERIMENT_FOLDER_NOT_FOUND_ACTION}</h4>
          <div className={ styles.container}>
          <input id="browse-dataset" className={"form-control width50 btn "+ styles.browseBtn} type="file"  />
          <Link to = {`${'/detailedexperiment' + '?'}${expInfo.folderPath}`} className="btn btn-warning" onClick={this.continueBtn.bind(this)}>Continue</Link>
          </div>
        </Modal>
        </div>
    );
  }
}

