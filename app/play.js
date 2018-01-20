<div onClick={this.toggleDiv.bind(this, "divid")} >
  <div >
    <div className="hide" id="divid" style={{zIndex: "1"}}>
      <br />
      <button  onClick={this.divRemainShowAndAlertHi(this, plateInfo)}>click me</button>
      <br/>
    </div>



  </div>
</div>


divRemainsShowAndAlertHi(){
  alert('Hi button click is working but drawer does not slides')
}


toggleDiv(id){
  // just hide/show logic
  const plateclass = document.getElementById(id);
  const changedclass = plateclass.className == 'show' ? 'hide' : 'show';
  plateclass.setAttribute('class', changedclass);
}
