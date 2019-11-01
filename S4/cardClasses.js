class Card {
  //Give where the top middle and bottom end
  constructor(top = 0,midTop = 1,midBottom = 2,bottom = 3){
    this.lineEndings = [top,midTop,midBottom,bottom];

    //see if we are trying to use the card or not
    this.activated = false;
    this.onPosition = null;
    this.offPosition = null;

    //if the card is activated we remember some colors
    this.leftColors = [null,null,null,null];
    this.rightColors = [null,null,null,null];

    this.cardBack = two.makeRoundedRectangle(0,0,cardWidth,cardHeight,15);
    this.cardBack.fill = 'lightgrey';
    this.cardBack.stroke = 'black';

    this.center = [0,0];

    this.blackPaths = [null,null,null,null]
    this.colorPaths = [null,null,null,null]

    //create all the paths
    for(var i=0;i<4;i++){
      this.blackPaths[i] = two.makePath(xList[0],yList[i],xList[1],yList[i],xList[2],yList[this.lineEndings[i]],xList[3],yList[this.lineEndings[i]],open = true);
      this.blackPaths[i].stroke = 'black';
      this.blackPaths[i].fill = 'none';
      this.blackPaths[i].linewidth = 2;

      this.colorPaths[i] = two.makePath(xList[0],yList[i],xList[1],yList[i],xList[2],yList[this.lineEndings[i]],xList[3],yList[this.lineEndings[i]],open = true);
      this.colorPaths[i].stroke = 'none';
      this.colorPaths[i].fill = 'none';
      this.colorPaths[i].linewidth = 3;
      this.colorPaths[i].dashes[0] = 300;
      this.colorPaths[i].dashes.offset = 300;
    }

    this.outerCircle = two.makeCircle(this.center[0],yList[4],10);
    this.outerCircle.fill = 'none';
    this.outerCircle.stroke = 'black';

    this.innerCircle = two.makeCircle(this.center[0],yList[4],5);
    this.innerCircle.fill = 'none';
    this.innerCircle.stroke = 'none';

    var inversionCount = 0;
    for(var i=0;i<4;i++){
      for(var j=i;j<4;j++){
        if(this.lineEndings[j]<this.lineEndings[i]){
          inversionCount++;
        }
      }
    }
    console.log(inversionCount);
    if(inversionCount%2==1){
      this.innerCircle.fill = 'black';
    }

    this.card = two.makeGroup(this.cardBack,this.blackPaths[0],this.blackPaths[1],this.blackPaths[2],this.blackPaths[3],this.colorPaths[0],this.colorPaths[1],this.colorPaths[2],this.colorPaths[3],this.innerCircle,this.outerCircle);
    this.card.translation.set(-100,-100);
    this.center = [-100,-100];
  }
  moveTo(position,timeLimit = .2){
    var moveX = position[0] - this.center[0];
    var moveY = position[1] - this.center[1];
    var stepLimit = 60 * timeLimit;
    var stepX = moveX/stepLimit;
    var stepY = moveY/stepLimit;
    var elapsed = 0;
    var animationData = [animateMove,[this,stepX,stepY,elapsed,stepLimit,this.center]];
    animationQueue.push(animationData);
    this.center = position;
  }

  colorize(){
    //First figure out what color each line is
    if(this.onPosition==0){
      for(var i=0;i<4;i++){
        this.leftColors[i] = colors[i];
      }
    }
    else{
      for(var i=0;i<4;i++){
        this.leftColors[i] = activeSlots[this.onPosition-1].rightColors[i];
      }
    }
    //Then set the colors of the line and associated lines and balls
    for(var i=0;i<4;i++){
      this.colorPaths[i].stroke = this.leftColors[i];
      this.rightColors[this.lineEndings[i]] = this.leftColors[i];
      powerBalls[2*this.onPosition+1][i].fill = this.leftColors[i];
      powerBalls[2*this.onPosition+2][this.lineEndings[i]].fill = this.leftColors[i];
      powerLines[this.onPosition][i].stroke = this.leftColors[i];
    }

    var leftLineData = [growLines,this.onPosition];
    animationQueue.push(leftLineData);
    var leftBallData = [growBalls,2*this.onPosition+1];
    animationQueue.push(leftBallData);
    var animationData = [animateColors,this];
    animationQueue.push(animationData);
    var rightBallData = [growBalls,2*this.onPosition+2];
    animationQueue.push(rightBallData);
  }
  decolorize(){
    for(var i=0;i<4;i++){
      console.log(i);
      this.colorPaths[i].stroke = 'none';
      this.colorPaths[i].dashes.offset = 300;
      this.leftColors[i] = null;
      this.rightColors[i] = null;
    }
    //decolorize the balls and lines too!
    for(var i = this.onPosition;i<7;i++){
      for(var j=0;j<4;j++){
        powerLines[i][j].dashes.offset=50;
        powerLines[i][j].stroke = 'none'
      }
    }
    for(var i=2*this.onPosition+1;i<16;i++){
      for(var j=0;j<4;j++){
        powerBalls[i][j].radius = 0;
        powerBalls[i][j].fill = 'none';
      }
    }
  }

  activate(){
    this.activated = true;
    this.onPosition = activeSlots.length
    this.moveTo(activePositions[this.onPosition]);
    activeSlots.push(this);
    inactiveSlots[this.offPosition] = null;
    console.log(inactiveSlots);
    this.colorize();
  }
  deactivate(){
    this.activated = false;
    inactiveSlots[this.offPosition] = this;
    this.decolorize();
    this.moveTo(inactivePositions[this.offPosition]);
  }

  onClick(){
    if(this.activated){
      this.deactivate();
      return true;
    }
    else{
      this.activate();
      return false;
    }
  }

  destroy(){
    this.cardBack.fill = 'none';
    this.cardBack.stroke = 'none';
    this.innerCircle.fill = 'none';
    this.outerCircle.stroke = 'none';
    for(var i=0;i<4;i++){
      this.blackPaths[i].stroke = 'none';
      this.colorPaths[i].stroke = 'none';
    }
    this.card.translation.set(-100,-100);
    this.center = [-100,-100];
  }
}

function generateCard(){
  orderedList = [0,1,2,3]
  randomList = []
  firstRandom = Math.floor(4*Math.random());
  randomList.push(orderedList[firstRandom]);
  orderedList.splice(firstRandom,1);
  secondRandom = Math.floor(3*Math.random());
  randomList.push(orderedList[secondRandom]);
  orderedList.splice(secondRandom,1);
  thirdRandom = Math.floor(2*Math.random());
  randomList.push(orderedList[thirdRandom]);
  orderedList.splice(thirdRandom,1);
  randomList.push(orderedList[0]);

  return new Card(randomList[0],randomList[1],randomList[2],randomList[3]);
}
function deal(){
  console.log(inactiveSlots);
  for(var i=0;i<inactiveSlots.length;i++){
    if(inactiveSlots[i]==null){
      inactiveSlots[i] = generateCard();
      inactiveSlots[i].moveTo(inactivePositions[i]);
      inactiveSlots[i].offPosition = i;
      cardList[i] = inactiveSlots[i];
    }
  }
}
