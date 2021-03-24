function animateMove(){
  newX = animationQueue[0][1][5][0] + animationQueue[0][1][1]*animationQueue[0][1][3];
  newY = animationQueue[0][1][5][1] + animationQueue[0][1][2]*animationQueue[0][1][3];
  if(animationQueue[0][1][3] < animationQueue[0][1][4] + 1){
    animationQueue[0][1][0].card.translation.set(newX,newY);
    animationQueue[0][1][3]++;
  }
  else{
    animationQueue.shift();
  }
}
function animateColors(){
  if(animationQueue[0][1].colorPaths[0].dashes.offset>0){
    for(var i=0;i<yPositions-1;i++){
      animationQueue[0][1].colorPaths[i].dashes.offset-=25;
    }
  }
  else{
    animationQueue.shift();
  }
}
function growBalls(){
  if(powerBalls[animationQueue[0][1]][0].radius<5.1){
    for(var i=0;i<yPositions-1;i++){
      powerBalls[animationQueue[0][1]][i].radius+=1;
    }
  }
  else{
    animationQueue.shift();
  }
}
function growLines(){
  if(powerLines[animationQueue[0][1]][0].dashes.offset > 0){
    for(var i=0;i<yPositions-1;i++){
      powerLines[animationQueue[0][1]][i].dashes.offset -= halfLineLength/4;
    }
  }
  else{
    for(var i=0;i<yPositions-1;i++){
      if(animationQueue[0][2][i]){
        powerDottedLines[animationQueue[0][1]][i].stroke = 'darkgrey';
      }
      else{
        powerDottedLines[animationQueue[0][1]][i].stroke = 'none';
      }
    }
    animationQueue.shift();
  }
}
function fadeCards(){
  if(activeSlots[0].cardBack.opacity>0){
    for(var i=0;i<activeSlots.length;i++){
      activeSlots[i].cardBack.opacity-=fadingSpeed
      for(var j=0;j<yPositions-1;j++){
        activeSlots[i].actionDots[j].opacity-=fadingSpeed;
      }
    }
  }
  else if(activeSlots[0].outerCircle.opacity>0){
    for(var i=0;i<activeSlots.length;i++){
      activeSlots[i].outerCircle.opacity-=fadingSpeed;
      activeSlots[i].innerCircle.opacity-=fadingSpeed;
    }
  }
  else{
    animationQueue.shift();
  }
}
function fadeLines(){
  if(activeSlots[0].blackPaths[0].opacity>0){
    for(var i=0;i<activeSlots.length;i++){
      for(var j=0;j<yPositions-1;j++){
        activeSlots[i].blackPaths[j].opacity-=fadingSpeed;
        activeSlots[i].colorPaths[j].opacity-=fadingSpeed;
        activeSlots[i].leftDottedPaths[j].opacity-=fadingSpeed;
        activeSlots[i].rightDottedPaths[j].opacity-=fadingSpeed;
      }
    }
    for(var i=0;i<numberOfSlots;i++){
      for(var j=0;j<yPositions-1;j++){
        powerLines[i][j].opacity -=fadingSpeed;
        powerDottedLines[i][j].opacity -=fadingSpeed;
      }
    }
  }
  else if(powerBalls[0][0].opacity>0){
    for(var i=0;i<2*numberOfSlots+1;i++){
      for(var j=0;j<yPositions-1;j++){
        powerBalls[i][j].opacity -=fadingSpeed;
      }
    }
  }
  else{
    animationQueue.shift();
  }
}

function pause(){
  if(animationQueue[0][1]>0){
    animationQueue[0][1]-=1;
  }
  else{
    animationQueue.shift();
  }
}
