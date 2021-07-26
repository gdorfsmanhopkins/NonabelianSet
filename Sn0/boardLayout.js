function makeBalls(){
  var balls = [];
  var groups = [];
  for (var i=0;i<2*numberOfSlots+2;i++){
    var nextColumn = [];
    var ballGroup = two.makeGroup();
    for(var k=0;k<yPositions-1;k++){
      newCircle = two.makeCircle(0,yList[k],0);
      newCircle.stroke = 'none';
      newCircle.fill = 'none';
      nextColumn.push(newCircle);
      ballGroup.add(newCircle);
    }
    moveBalls(i,ballGroup);
    balls.push(nextColumn);
  }
  return balls;
}
function moveBalls(column,ballGroup){
  if((column%2)==0){
    i = column/2;
    ballGroup.translation.set(activePositions[i][0] + cardWidth/2 - 4*cardWidth/3,activeY);
  }
  else{
    i = (column-1)/2;
    ballGroup.translation.set(activePositions[i][0] - cardWidth/2 ,activeY);
  }
}

function makeLines(){
  //halfLineLength = (xList[0]+4*cardWidth/3)-xList[3]; This might be better as a global variable to help consistently offset the dashes on different sized screens
  lines = []
  for(var i=0;i<numberOfSlots+1;i++){
    nextColumn = []
    var lineGroup = two.makeGroup();
    for(var j=0;j<yPositions-1;j++){
      newLine = two.makePath(-1*halfLineLength,yList[j],0,yList[j],open=true);
      newLine.stroke = 'none';
      newLine.fill = 'none';
      newLine.linewidth = 5;
      newLine.dashes[0] = 1.5*halfLineLength;
      newLine.dashes.offset = 1.5*halfLineLength;
      lineGroup.add(newLine);
      nextColumn.push(newLine);
    }
    moveLines(i,lineGroup);
    lines.push(nextColumn);
  }
  return lines;
}
function moveLines(column,lineGroup){
  lineGroup.translation.set(inactivePositions[column][0] - cardWidth/2,activeY);
}

function findInsertionPoint(newPosition){
  for(var actives=0;actives<activeSlots.length;actives++){
    if(newPosition<activeSlots[actives].offPosition){
      return actives;
    }
  }
  return activeSlots.length;
}
function insertCard(startingPoints){
  for(j = activeSlots.length-1;j>startingPoints;j--){
    for(k=0;k<yPositions-1;k++){
      activeSlots[j].colorPaths[k].dashes.offset=300;
      powerLines[j][k].dashes.offset=1.5*halfLineLength;
      powerLines[j][k].stroke = 'none'
      powerBalls[2*j][k].radius = 0;
      powerBalls[2*j][k].fill = 'none';
      powerBalls[2*j+1][k].radius = 0;
      powerBalls[2*j+1][k].fill = 'none';
    }
    activeSlots[j].moveTo(activePositions[j]);
    activeSlots[j].onPosition = j;
  }
  activeSlots[startingPoints].moveTo(activePositions[startingPoints]);
  for(j=startingPoints;j<activeSlots.length;j++){
    activeSlots[j].colorize();
  }

}

function cleanUpActive(i){
  activeSlots.splice(i,1);
  for(j = i;j<activeSlots.length;j++){
    for(k=0;k<yPositions-1;k++){
      activeSlots[j].colorPaths[k].dashes.offset=300;
    }
    activeSlots[j].moveTo(activePositions[j]);
    activeSlots[j].onPosition = j;
    activeSlots[j].colorize();
  }
}
function checkWinCondition(){
  var n = activeSlots.length;
  if(n>2){
    winning = true;
    for(var i=0;i<yPositions-2;i++){
      if(activeSlots[n-1].rightColors[i]!=colors[i]){
        winning=false;
        break
      }
    }
    if(winning==true){
      //animationQueue.push([fadeAll])
      animationQueue.push([fadeCards]);
      //animationQueue.push([pause,120]);
      animationQueue.push([fadeLines]);
      //the next one is not an animation, but we want it to happen after the win animation
      animationQueue.push([nextRound]);
    }
  }
}
function nextRound(){
  for(var i=0;i<activeSlots.length;i++){
    //if were not allowing repeats we must remove the cards from the list of those in play
      if(!allowRepeats){
      for(var j=0;j<activeCards.length;j++){
        if(activeSlots[i].lineEndings==activeCards[j]){
          activeCards.splice(j,1);
          j--;
        }
      }
    }
    activeSlots[i].destroy();
  }
  activeSlots = [];
  deal();
  powerBalls = makeBalls();
  powerLines = makeLines();
  for (var i=0;i<yPositions-1;i++){
    powerBalls[0][i].fill=colors[i];
    animationQueue.push([growBalls,0]);
  }
  animationQueue.shift();
}
