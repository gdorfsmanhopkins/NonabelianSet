function makeBalls(){
  var balls = [];
  var groups = [];
  for (var i=0;i<16;i++){
    var nextColumn = [];
    for(var k=0;k<4;k++){
      newCircle = two.makeCircle(0,yList[k],0);
      newCircle.stroke = 'none';
      newCircle.fill = 'none';
      nextColumn.push(newCircle);
    }
    var ballGroup = two.makeGroup(nextColumn[0],nextColumn[1],nextColumn[2],nextColumn[3]);
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
  halfLineLength = (xList[0]+4*cardWidth/3)-xList[3];
  console.log(halfLineLength);
  lines = []
  for(var i=0;i<8;i++){
    nextColumn = []
    for(var j=0;j<4;j++){
      newLine = two.makePath(-1*halfLineLength,yList[j],0,yList[j],open=true);
      newLine.stroke = 'none';
      newLine.fill = 'none';
      newLine.linewidth = 5;
      newLine.dashes[0] = 50;
      newLine.dashes.offset = 50;
      nextColumn.push(newLine);
    }
    var lineGroup = two.makeGroup(nextColumn[0],nextColumn[1],nextColumn[2],nextColumn[3]);
    moveLines(i,lineGroup);
    lines.push(nextColumn);
  }
  return lines;
}
function moveLines(column,lineGroup){
  lineGroup.translation.set(inactivePositions[column][0] - cardWidth/2,activeY);
}

function cleanUpActive(i){
  activeSlots.splice(i,1);
  for(j = i;j<activeSlots.length;j++){
    for(k=0;k<4;k++){
      activeSlots[j].colorPaths[k].dashes.offset=300;
    }
    activeSlots[j].moveTo(activePositions[j]);
    activeSlots[j].onPosition = j;
    activeSlots[j].colorize();
  }
}
function checkWinCondition(){
  var n = activeSlots.length
  if(n>2){
    if(activeSlots[n-1].rightColors[0]==colors[0]){
      if(activeSlots[n-1].rightColors[1]==colors[1]){
        if(activeSlots[n-1].rightColors[2]==colors[2]){
          animationQueue.push([fadeCards]);
          animationQueue.push([pause,120]);
          animationQueue.push([fadeLines]);
          //the next one is not an animation, but we want it to happen after the win animation
          animationQueue.push([nextRound]);
        }
      }
    }
  }
}
function nextRound(){

  for(var i=0;i<activeSlots.length;i++){
    activeSlots[i].destroy();
  }
  activeSlots = [];
  deal();
  powerBalls = makeBalls();
  powerLines = makeLines();
  for (var i=0;i<4;i++){
    powerBalls[0][i].fill=colors[i];
    animationQueue.push([growBalls,0]);
  }
  animationQueue.shift();
}
