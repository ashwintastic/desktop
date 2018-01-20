import fs from 'fs';
import path from 'path';
import { CARRAIGE_NAME_PATTERN, VALID_SAMPLE_FILE_PATTERN } from '../config/fileNameRegex';
import { PLATE_TYPE } from '../config/enums';
import { FILES_PER_SAMPLE } from '../constants/index';
import { DIRECTORY_CONTAINING_ONLY_IMAGES } from '../config/fileNameRegex';
import stylesOverlay from '../components/SampleDetailOverlay.css';
import { EXPERIMENT_FOLDER_NOT_FOUND, IMAGE_NOT_FOUND } from '../constants/messages';
import React from 'react'
const logger = require('electron').remote.getGlobal('logger');

const CHECK_POINT_HEIGHT = 2;
let CURRENT_HEIGHT = 0;
const CHAR_CODE_START = 'A'.charCodeAt(0);

const RESPONSE = {
  isValid: false,
  path: []
};

// TODO :: temporary patch algo needs optimization
Array.prototype.unique = function () {
  const a = [];
  for (let i = 0; i < this.length; i++) {
    const current = this[i];
    if (a.indexOf(current) < 0) a.push(current);
  }
  return a;
};

class FileUtil {

  getSampleImage(dirPath, sampleName) {
    // TODO:x explicit sorting to ensure we read all images for a sample in right order and exclude the marked image only.
    const allImages = new Array();
    const filesInDir = fs.readdirSync(dirPath);
    const imagePattern = new RegExp(`^${sampleName}_`);
    let i = 1;
    filesInDir.forEach((file) => {
      if (file.match(imagePattern)) {
        if (i != 4) {
          allImages.push(`${dirPath}/${file}`);
        }
        i += 1;
      }
    });
    return allImages;
  }


  itReturnsAllFilesInDir(dirPath) {
    this.rootNode = dirPath;
    const self = this;
    this.allDir = [];
    let filesInDir = []
    try{
      filesInDir = fs.readdirSync(dirPath);
    }
    catch(e){
      return 'Some error occured';
    }
    CURRENT_HEIGHT += 1;

    filesInDir.forEach((file) => {
      if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
        const filesInDir = fs.readdirSync(`${dirPath}/${file}`);
        if (filesInDir != 0) {
          self.allDir.push(`${dirPath}/${file}`);
        }
      }
    });

    return self.allDir;
  }

  async validateExperimentDataset(rootNode) {
    CURRENT_HEIGHT = 0;
    RESPONSE.isValid = false;
    RESPONSE.path = [];
    this.dfsStack = [];
    this.dfsStack = await this.itReturnsAllFilesInDir(rootNode);

    if (this.dfsStack.length == 0) {
      return RESPONSE;
    }

    const folderTovisit = this.dfsStack.pop();
    const response = await this.fileItirator(folderTovisit, rootNode);

    if (response.isValid) {
      response.path = response.path.unique();
      response.rootNode = this.rootNode;
      response.experimentDTO = this.getExperimentDTO(response.rootNode, response.path);
    }
    // logger.debug('Response is: ', response);
    return response;
  }

  fileItirator(folderTovisit, rootNode) {
    const self = this;
    let response = false;
    CURRENT_HEIGHT += 1;
    const dirPath = folderTovisit;
    const filesInDir = fs.readdirSync(folderTovisit);


    filesInDir.forEach((file) => {
      if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
        if (CHECK_POINT_HEIGHT == CURRENT_HEIGHT) {
          // this is the point where we have to check if RC/LC exist
          response = self.checkIfRequiredFileExist(dirPath, rootNode);
          if (self.dfsStack.length == 0) {
            // scanned all folders in given directory
            return (RESPONSE);
          }
          CURRENT_HEIGHT = 1;
          const folderTovisit = self.dfsStack.pop();
          self.fileItirator(folderTovisit);
        }

        if ((CHECK_POINT_HEIGHT == CURRENT_HEIGHT) && !response.isValid) {
          // checked at specific height but not RC/LC found
          CURRENT_HEIGHT = 1;
          if (self.dfsStack.length == 0) {
            // scanned all folders in given directory
            return (RESPONSE);
          }

          const folderTovisit = self.dfsStack.pop();
          self.fileItirator(folderTovisit);
        }

    /*    if (CURRENT_HEIGHT < CHECK_POINT_HEIGHT) {
          // deep down the tree
          const currentDirPath = `${dirPath}/${file}`;
          self.dfsStack.push(currentDirPath);
          self.fileItirator(currentDirPath);
        }*/
      }
    });

    return RESPONSE;
  }

  checkIfRequiredFileExist(dirPath, rootNode) {
    let checkedNode = 0;
    const self = this;
    let response = '';
    const filesInDir = fs.readdirSync(dirPath);

    filesInDir.forEach((file) => {
      if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
        checkedNode++;
        response = self.checkpoint(file, filesInDir, dirPath, checkedNode, rootNode);
      }
    });

    return response;
  }

  checkpoint(file, filesInDir, dirPath, checkedNode, rootNode) {
    const isValidStruct = this.validatePlate(file);

    if (isValidStruct === true) {
      RESPONSE.isValid = true;
      RESPONSE.path.push(`${dirPath}/${file}`);
      RESPONSE.experimentDTO = null;
      RESPONSE.rootNode = rootNode;
    }

    if ((checkedNode == filesInDir.length) && !RESPONSE.isValid) {
      RESPONSE.isValid = false;
    }

    return RESPONSE;
  }

  validatePlate(carraigeName) {
    if (carraigeName.match(CARRAIGE_NAME_PATTERN)) {
      return true;
    }
  }

  getExperimentDTO(experimentDir, validPlates) {
    const experimentDTO = {};
    experimentDTO.name = path.basename(experimentDir);
    experimentDTO.folderPath = experimentDir;
    experimentDTO.plates = [];

    validPlates.map((validPlate) => {
      let maxAlpha = 'A';
      let maxNum = 1;

      const samples = {};
      const plate = {};

      plate.name = path.basename(path.dirname(validPlate));
      plate.carraigeType = path.basename(validPlate);

      // Read all files in plate dir
      const filesInDir = fs.readdirSync(validPlate);

      if (filesInDir == null) { // Files does not exists
        logger.error('Some error reading total samples.');
      } else if (filesInDir.length == 0) { // Files does not exists
        logger.info('No files in plate folder.');
      } else {
        filesInDir.forEach((file) => {
          if (this.validSampleFile(file)) {
            const sample = file.split('_')[0];
            if (samples[sample] !== undefined && samples[sample] !== null){
              samples[sample] += 1;
            } else {
              samples[sample] = 1;
            }

            if (sample.charCodeAt(0) > maxAlpha.charCodeAt(0)) maxAlpha = sample.charAt(0);
            const tempNum = parseInt(sample.substring(1), 10);
            if (tempNum > maxNum) maxNum = tempNum;
          }
        });

        const totalSamples = Object.keys(samples).filter(sampleName => {
          return samples[sampleName] == FILES_PER_SAMPLE;
        }).length;

        if (totalSamples > 0) {
          plate.plateType = this.getPlateType(maxAlpha, maxNum);

          if (plate.plateType !== 0) {
            plate.totalSamples = totalSamples;
            experimentDTO.plates[experimentDTO.plates.length] = plate;
          } else {
            logger.error('ERROR: INVALID plate Type maxAlpha: {} maxNum: {}.', maxAlpha, maxNum);
          }
        } else {
          logger.info('No files in plate folder.');
        }
      }
    });

    return experimentDTO;
  }

  // filter-out hidden other files and select plateType as well.
  validSampleFile(fileName) {
    return fileName.match(VALID_SAMPLE_FILE_PATTERN);
  }

  getPlateType(maxAlpha, maxNum) {
    if (maxAlpha.charCodeAt(0) < (CHAR_CODE_START + PLATE_TYPE.S96.rows)
      || maxNum <= PLATE_TYPE.S96.cols) {
      return PLATE_TYPE.S96.id;
    } else if (maxAlpha.charCodeAt(0) < (CHAR_CODE_START + PLATE_TYPE.S384.rows)
      || maxNum <= PLATE_TYPE.S384.cols) {
      return PLATE_TYPE.S384.id;
    }

    return 0; // INVALID PLATE
  }


  getImagePathDir(experimentInfo, name) {
    const folderPath = `${experimentInfo.folderPath}/${name}`;
    return folderPath;
  }

  getImages(imagePathFolder, sampleName) {
    let allMatchedImages = new Array();

    const allDir = this.itReturnsAllFilesInDir(imagePathFolder);

    if(typeof allDir == 'string'){
      return {
        message: EXPERIMENT_FOLDER_NOT_FOUND
      };
    }

    for (const i of allDir) {
      if (i.match(DIRECTORY_CONTAINING_ONLY_IMAGES)) {
        allMatchedImages = this.getSampleImage(i, sampleName);  // fileUtils
        break;
      }
    }
    if (allMatchedImages.length == 0) {
      return {
        message: IMAGE_NOT_FOUND
      };
    }

    const imageArray = [];

    allMatchedImages.map((i) => {
      imageArray.push(<div key={i}><img src={i} className={stylesOverlay.sampleImg} /></div>);
    });
    return imageArray;
  }

}

export default new FileUtil();
