/*function makeBalls(){
  var balls = [];
  var groups = [];
  for (var i=0;i<2*Game.sizeOfHand+2;i++){
    var nextColumn = [];
    var ballGroup = two.makeGroup();
    for(var k=0;k<Game.yPositions-1;k++){
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
    ballGroup.translation.set(Game.activePositions[i][0] + Game.cardWidth/2 - 4*Game.cardWidth/3,Game.activeY);
  }
  else{
    i = (column-1)/2;
    ballGroup.translation.set(Game.activePositions[i][0] - Game.cardWidth/2 ,Game.activeY);
  }
}

function makeLines(){
  halfLineLength = (Game.xList[0]+4*Game.cardWidth/3)-Game.xList[3];
  lines = []
  for(var i=0;i<Game.sizeOfHand+1;i++){
    nextColumn = []
    var lineGroup = two.makeGroup();
    for(var j=0;j<Game.yPositions-1;j++){
      newLine = two.makePath(-1*halfLineLength,Game.yList[j],0,Game.yList[j],open=true);
      newLine.stroke = 'none';
      newLine.fill = 'none';
      newLine.linewidth = 5;
      newLine.dashes[0] = 50;
      newLine.dashes.offset = 50;
      lineGroup.add(newLine);
      nextColumn.push(newLine);
    }
    moveLines(i,lineGroup);
    lines.push(nextColumn);
  }
  return lines;
}
function moveLines(column,lineGroup){
  lineGroup.translation.set(Game.inactivePositions[column][0] - Game.cardWidth/2,Game.activeY);
}

function cleanUpActive(i){
  freeze = true;
  time = performance.now();

  //first put unfreeze in the animation queue,
  animationQ.push({
    start: time,
    duration: 500*(Game.activeSlots.length - i - 1),
    callback: (t) => {},
    finish: () => {freeze = false}
  })

  //the do the actual cleanup (animation and color swaps)
  Game.activeSlots.splice(i,1);
  for(j = i;j<Game.activeSlots.length;j++){
    for(k=0;k<Game.yPositions-1;k++){
      Game.activeSlots[j].colorPaths[k].dashes.offset=300;
    }
    Game.activeSlots[j].moveTo(Game.activePositions[j],time + 100*(j-i)); //staggering start is a nice effect
    Game.activeSlots[j].onPosition = j;
    Game.activeSlots[j].colorize(350+500*(j-i));
  }
}
function checkWinCondition(){
  var n = Game.activeSlots.length;
  if(n>2){
    winning = true;
    for(var i=0;i<Game.yPositions-2;i++){
      if(Game.activeSlots[n-1].rightColors[i]!=colors[i]){
        winning=false;
        break
      }
    }
    if(winning==true){
      freeze = true;
      const time = performance.now();
      //first fade cards
      animationQ.push({
        start: time+500,
        duration: 1000,
        callback: (t) => {
          for(var i=0;i<n;i++){
            Game.activeSlots[i].cardBack.opacity = 1-t;
          }
        },
        finish: () => {
          for(var i=0;i<n;i++ ){
            Game.activeSlots[i].cardBack.opacity = 0;
          }
        }
      });
      //then fade balls and make the lines skinny
      animationQ.push({
        start: time + 1500,
        duration: 1000,
        callback: (t) => {
          for(var j=0;j<Game.yPositions-1;j++){
            //fade theballs
            for(var i=1;i<2*n;i++){
              powerBalls[i][j].opacity = 1-t;
            }
            //thin the lines
            for(var i=0;i<Game.sizeOfHand-1;i++){
              powerLines[i][j].linewidth = 5*(1-t) + 3*t;
            }
          }
          for(var i=0;i<n;i++){
            Game.activeSlots[i].outerCircle.opacity = 1-t;
            Game.activeSlots[i].innerCircle.opacity = 1-t;
          }
        },
        finish: () => {
          for(var j=0;j<Game.yPositions-1;j++){
            //fade theballs
            for(var i=1;i<2*n;i++){
              powerBalls[i][j].opacity = 0;
            }
            //thin the lines
            for(var i=0;i<Game.sizeOfHand-1;i++){
              powerLines[i][j].linewidth = 3;
              powerLines[i][j].opacity = 1;
            }
          }
          for(var i=0;i<n;i++){
            Game.activeSlots[i].outerCircle.opacity = 0;
            Game.activeSlots[i].innerCircle.opacity = 0;
          }

        }
      });
      //Finally, fade the paths,lines, and remaining balls):
      animationQ.push({
        start: time+5000,
        duration: 1000,
        callback: (t) =>{
          for(var j = 0; j<Game.yPositions-1;j++){
            //balls:
            powerBalls[0][j].opacity = 1-t;
            powerBalls[2*n][j].opacity = 1-t;

            //paths:
            for(var i=0;i<n;i++){
              activeSlots[i].blackPaths[j].opacity = 0;
              activeSlots[i].colorPaths[j].opacity = 1-t;
            }

            //lines:
            for(var i=0;i<Game.sizeOfHand-1;i++){
              powerLines[i][j].opacity = 1-t;
            }
          }
        },
        finish: () =>{
          for(var j = 0; j<Game.yPositions-1;j++){
            //balls:
            powerBalls[0][j].opacity = 0;
            powerBalls[2*n][j].opacity = 0;

            //paths:
            for(var i=0;i<n;i++){
              Game.activeSlots[i].blackPaths[j].opacity = 0;
              Game.activeSlots[i].colorPaths[j].opacity = 0;
            }

            //lines:
            for(var i=0;i<Game.sizeOfHand-1;i++){
              powerLines[i][j].opacity = 0;
            }
          }
        }
      })
      //Do the next round at the right time
      animationQ.push({
        start: time + 6000,
        duration: 100,
        callback: (t) => {},
        finish: () => {
          //console.log(animationQ);
          freeze = false;
          //Destroy old cards
          for(var i=0;i<Game.activeSlots.length;i++){
            Game.activeSlots[i].destroy();
          }
          //and start the next round
          newRound();
        }
      });
    }
  }
}
function newRound(){
  //console.log("starting new round");
  activeSlots = [];
  deal();
  powerBalls = makeBalls();
  powerLines = makeLines();
  for (var i=0;i<Game.yPositions-1;i++){
    //console.log(colors[i]);
    const ball = powerBalls[0][i];
    ball.fill=colors[i]
    animationQ.push({
      start: performance.now(),
      duration: 100,
      callback: (t) => {
        ball.radius = 5*t;
      },
      finish: () => {
        ball.radius = 5;
      }
    });
  }
}
*/
