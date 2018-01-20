class SampleTraversal {

  nextSampleWithGivenStatus(data, status, currentNode){
   const tempState = data;
   const plateName = Object.keys(tempState.nodes)[0];
   const nextSample = this.checkPlateOfSimilarStatus(currentNode, tempState, plateName, status);
   return nextSample
 }


  nextSample(tempState, currentNode){
    const plateName = Object.keys(tempState.nodes)[0];
    let nextSampleName = tempState.nodes[plateName][currentNode].nextNode;
    let nextSample = tempState.nodes[plateName][nextSampleName];
    if (typeof nextSample === 'undefined') {
      return false;
    }
    while (nextSample.nextNode != null) {
      if(nextSample.cellInfo.status != null){
        return nextSample
      }
      nextSampleName = nextSample.nextNode;
      nextSample = tempState.nodes[plateName][nextSampleName];
    }
    if (nextSample.cellInfo.status != null ) {
      return nextSample;
    }
    return false
  }

  checkPlateOfSimilarStatus(currentNode, tempState, plateName, status) {
    let nextSampleName = tempState.nodes[plateName][currentNode].nextNode;
    let nextSample = tempState.nodes[plateName][nextSampleName];

    if (typeof nextSample === 'undefined') {
      return false;
    }
    while (nextSample.nextNode != null) {
      /*if (nextSample.cellInfo.overRideVal == status) {
        return nextSample;
      }*/
      if (nextSample.cellInfo.status == status ) {
        return nextSample;
      }
      nextSampleName = nextSample.nextNode;
      nextSample = tempState.nodes[plateName][nextSampleName];
    }
    if (nextSample.cellInfo.status == status ) {
      return nextSample;
    }
    return false;
  }


}

export default new SampleTraversal();
