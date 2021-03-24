class Card {
  constructor(numberOfLines,lineEndings,action){
    this.numberOfLines = numberOfLines; //How many lines on the card
    this.lineEndings = lineEndings; //This is the permutation [a,b,c,...] of the line
    this.action = action; //This holds which lines Z2 acts on

    //see if we are trying to use the card or not, and where it's living
    this.activated = false;
    this.onPosition = null;
    this.offPosition = null;

    //if the card is activated we remember the colors on the left and right
    this.leftColors = [];
    this.rightColors = [];
    //Also we remember whether each line is dotted on the left and right
    this.leftDotted = [];
    this.rightDotted = [];

    for(var i=0;i<numberOfLines;i++){
      this.leftColors.push(null);
      this.rightColors.push(null);
      this.leftDotted.push(null);
      this.rightDotted.push(null);
    }

    this.cardBack = two.makeRoundedRectangle(0,0,cardWidth,cardHeight,15);
    this.cardBack.fill = 'lightgrey';
    this.cardBack.stroke = 'darkgrey';
    this.cardBack.linewidth = 3;

    this.center = [0,0];

    this.blackPaths = [];
    this.colorPaths = [];
    this.rightDottedPaths = [];
    this.leftDottedPaths = [];
    this.actionDots = [];

    //create all the paths, and action dots
    for(var i=0;i<numberOfLines;i++){
      var newBlackPath = two.makePath(xList[0],yList[i],xList[1],yList[i],xList[2],yList[this.lineEndings[i]],xList[3],yList[this.lineEndings[i]],open = true);
      newBlackPath.stroke = 'darkgrey';
      newBlackPath.fill = 'none';
      newBlackPath.linewidth = 2;

      var newColorPath = two.makePath(xList[0],yList[i],xList[1],yList[i],xList[2],yList[this.lineEndings[i]],xList[3],yList[this.lineEndings[i]],open = true);
      newColorPath.stroke = 'none';
      newColorPath.fill = 'none';
      newColorPath.linewidth = 3;
      newColorPath.dashes[0] = 300;
      newColorPath.dashes.offset = 300;

      var newRightDottedPath = two.makePath((xList[0]+xList[1])/2,yList[i],xList[1],yList[i],xList[2],yList[this.lineEndings[i]],xList[3],yList[this.lineEndings[i]],open = true);
      newRightDottedPath.stroke = 'none';
      newRightDottedPath.fill = 'none';
      newRightDottedPath.linewidth = 2;
      newRightDottedPath.dashes[0] = 5;

      var newLeftDottedPath = two.makePath(xList[0],yList[i],(xList[0]+xList[1])/2,yList[i],open = true);
      newLeftDottedPath.stroke = 'none';
      newLeftDottedPath.fill = 'none';
      newLeftDottedPath.linewidth = 2;
      newLeftDottedPath.dashes[0] = 5;

      var newActionDot = two.makeCircle((xList[0]+xList[1])/2,yList[i],5);
      newActionDot.stroke = 'none';
      if(this.action[i]){
        newActionDot.fill = 'black';
      }
      else{
        newActionDot.fill = 'none';
      }

      this.blackPaths.push(newBlackPath);
      this.colorPaths.push(newColorPath);
      this.rightDottedPaths.push(newRightDottedPath);
      this.leftDottedPaths.push(newLeftDottedPath)
      this.actionDots.push(newActionDot)
    }

    this.outerCircle = two.makeCircle(this.center[0],yList[this.numberOfLines],10);
    this.outerCircle.fill = 'none';
    this.outerCircle.stroke = 'black';

    this.innerCircle = two.makeCircle(this.center[0],yList[this.numberOfLines],5);
    this.innerCircle.fill = 'none';
    this.innerCircle.stroke = 'none';

    //Next we must figure out if we're an inversion.
    var inversionCount = 0;
    for(var i=0;i<this.numberOfLines;i++){
      for(var j=i;j<this.numberOfLines;j++){
        if(this.lineEndings[j]<this.lineEndings[i]){
          inversionCount++;
        }
      }
    }
    if(inversionCount%2==1){
      this.innerCircle.fill = 'black';
    }

    this.card = two.makeGroup(this.cardBack, this.innerCircle, this.outerCircle);
    for(var i=0;i<this.numberOfLines;i++){
      this.card.add(this.blackPaths[i]);
      this.card.add(this.colorPaths[i]);
      this.card.add(this.leftDottedPaths[i]);
      this.card.add(this.rightDottedPaths[i]);
      this.card.add(this.actionDots[i]);
    }
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
    //First figure out what color each line is and whether it's dotted on the left
    if(this.onPosition==0){
      for(var i=0;i<this.numberOfLines;i++){
        this.leftColors[i] = colors[i];
        this.leftDotted[i] = false;
      }
    }
    else{
      for(var i=0;i<this.numberOfLines;i++){
        this.leftColors[i] = activeSlots[this.onPosition-1].rightColors[i];
        this.leftDotted[i] = activeSlots[this.onPosition-1].rightDotted[i];
      }
    }
    //Then set the colors and dotted nature of the line and associated lines and ball
    for(var i=0;i<this.numberOfLines;i++){
      this.colorPaths[i].stroke = this.leftColors[i];
      this.rightColors[this.lineEndings[i]] = this.leftColors[i];
      powerBalls[2*this.onPosition+1][i].fill = this.leftColors[i];
      powerBalls[2*this.onPosition+2][this.lineEndings[i]].fill = this.leftColors[i];
      powerLines[this.onPosition][i].stroke = this.leftColors[i];
    }

    //Turn on/off the dotted lines if necessary
    for(var i=0;i<this.numberOfLines;i++){
      //save the necessary data
      if(this.leftDotted[i]){
        this.leftDottedPaths[i].stroke = 'darkgrey';
        if(this.action[i]==false){
          this.rightDottedPaths[i].stroke = 'darkgrey';
          this.rightDotted[this.lineEndings[i]] = true;
        }
        else{
          this.rightDottedPaths[i].stroke = 'none';
          this.rightDotted[this.lineEndings[i]] = false;
        }
      }
      else{
        this.leftDottedPaths[i].stroke = 'none';
        if(this.action[i]==false){
          this.rightDottedPaths[i].stroke = 'none';
          this.rightDotted[this.lineEndings[i]] = false;
        }
        else{
          this.rightDottedPaths[i].stroke = 'darkgrey';
          this.rightDotted[this.lineEndings[i]] = true;
        }
      }
    }
    var leftLineData = [growLines,this.onPosition,this.leftDotted];
    animationQueue.push(leftLineData);
    var leftBallData = [growBalls,2*this.onPosition+1];
    animationQueue.push(leftBallData);
    var animationData = [animateColors,this];
    animationQueue.push(animationData);
    var rightBallData = [growBalls,2*this.onPosition+2];
    animationQueue.push(rightBallData);
  }
  decolorize(){
    for(var i=0;i<this.numberOfLines;i++){
      this.colorPaths[i].stroke = 'none';
      this.colorPaths[i].dashes.offset = 300;
      this.leftColors[i] = null;
      this.rightColors[i] = null;
      this.leftDottedPaths[i].stroke = 'none';
      this.rightDottedPaths[i].stroke = 'none';
      this.leftDotted[i] = null;
      this.rightDotted[i] = null;
    }
    //decolorize the balls and lines too!
    //NOTE: 7 and 16 should be replaced by cardsInPlay and 2*(cardsInPlay+1)
    for(var i = this.onPosition;i<numberOfSlots + 1;i++){
      for(var j=0;j<this.numberOfLines;j++){
        powerLines[i][j].dashes.offset=1.5*halfLineLength;
        powerLines[i][j].stroke = 'none';
        powerDottedLines[i][j].stroke = 'none';
      }
    }
    for(var i=2*this.onPosition+1;i<2*numberOfSlots+2;i++){
      for(var j=0;j<this.numberOfLines;j++){
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
    for(var i=0;i<this.numberOfLines;i++){
      this.blackPaths[i].stroke = 'none';
      this.colorPaths[i].stroke = 'none';
      this.leftDottedPaths[i].stroke = 'none';
      this.rightDottedPaths[i].stroke = 'none';
    }
    this.card.translation.set(-100,-100);
    this.center = [-100,-100];
  }
}
class S3Card extends Card{
  constructor(lineEndings){
    super(3,lineEndings)
  }
}
class S4Card extends Card{
  constructor(lineEndings){
    super(4,lineEndings);
  }
}

function generatePermutation(numberOfLetters){
  //list of integers 0,..,n-1
  var orderedList = [];
  for(var i=0;i<numberOfLetters;i++){
    orderedList.push(i);
  }
  //Randomize the order of the list
  var randomList = [];
  for(var i=numberOfLetters;i>0;i--){
    nextRandom = Math.floor(i*Math.random());
    randomList.push(orderedList[nextRandom]);
    orderedList.splice(nextRandom,1)
  }
  return randomList;
}

function generateAction(numberOfLetters){
  //This should be a subset of 0,1,...,n-1 which are the ones getting acted on by Z/2
  var actionList = [];
  for(var i=0;i<numberOfLetters;i++){
    if(Math.random()<.5){
      actionList.push(true);
    }
    else{
      actionList.push(false);
    }
  }
  return actionList;
}

function deal(){
  for(var i=0;i<inactiveSlots.length;i++){
    if(inactiveSlots[i]==null){
      console.log("Inactive Slot:",i);
      newPermutation = generatePermutation(yPositions-1);
      newAction = generateAction(yPositions-1);
      inactiveSlots[i] = new Card(yPositions - 1,newPermutation,newAction);
      inactiveSlots[i].moveTo(inactivePositions[i]);
      inactiveSlots[i].offPosition = i;
      cardList[i] = inactiveSlots[i];
    }
  }
}
