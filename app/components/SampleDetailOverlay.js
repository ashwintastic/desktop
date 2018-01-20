import React, { Component, PropTypes } from 'react';
import Slider from 'react-slick';
import styles from './SampleDetailOverlay.css';
import DropDownAndSaveBtn from './SampleOverLay/DropDownAndSaveBtn';
import DropDownAndNextBtn from './SampleOverLay/DropDownAndNextBtn';
import AnalysisComponent from './SampleOverLay/AnalysisComponent';
import keyEvent from '../keyEvents/keyEvents';
import FileUtils from '../helper/fileUtil';
class SampleDetailOverlay extends Component {

  resetAndShowNextSample(currentNode, status) {
    this.props.showNextSample(currentNode, status);
    this.refs.slider.slickGoTo(0);
  }

  render() {
    const { experimentInfo, onChangeStatus, saveChanges, hideOverlay } = this.props;
    const plateName = `${`${experimentInfo.name}(${experimentInfo.carraigeType})`}`;

    const imagePathFolder = FileUtils.getImagePathDir(this.props.experimentInfo.expInfo, this.props.experimentInfo.name);
    const imagesPathArray = FileUtils.getImages(imagePathFolder,this.props.experimentInfo.sampleName);

    const settings = {
      arrows: true,
      dots: true,
      infinite: false,
      autoplay: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      initialSlide: 0,
      fade: true,
      accessibility: false
    };


    return (
      <div className={styles.overlayContainer} >
        <i id = "closeoverlay" className={`fa fa-times fa-lg ${styles.crossbtn}`} aria-hidden="true" onClick={hideOverlay.bind(this)} />

        <div className="row">
          <h6 className={styles.plateHeader}>{plateName}</h6>
        </div>

        <div className="row">
          <div className="col-md-9">
            <h5 className={styles.sampleheaders}>Sample: {experimentInfo.sampleName}</h5>
          </div>
          <DropDownAndSaveBtn
            experimentInfo={experimentInfo}
            onChangeStatus={onChangeStatus}
            saveChanges={saveChanges}
          />
        </div>

        <div className="row" style={{ height: '450px' }}>
          <div className="col-md-9">
            <Slider ref="slider" {...settings}>
              {imagesPathArray}
            </Slider>
          </div>
          {typeof experimentInfo.analysis !== 'undefined' && <AnalysisComponent analysis={experimentInfo.analysis} />}
        </div>

        <div className="row">
          <div className="col-md-9" />
          <DropDownAndNextBtn
            experimentInfo={experimentInfo}
            showNextSample={this.resetAndShowNextSample.bind(this)}
          />
        </div>
      </div>
    );
  }
}

SampleDetailOverlay.propTypes = {
  experimentInfo: PropTypes.object,
  onChangeStatus: PropTypes.func,
  showNextSample: PropTypes.func
};

export default SampleDetailOverlay;

window.onkeydown = function(event) {
  let closebtn = document.getElementById('closeoverlay');
  if(event.keyCode == 27 && closebtn != null) {
    closebtn.click();
  }

}
