class Card {
  constructor(numberOfLinesTop,numberOfLinesBottom,lineEndings){
    this.numberOfLinesTop = numberOfLinesTop; //How many lines on the card
    this.numberOfLinesBottom = numberOfLinesBottom; //repeat for the second factor of the direct product

    //record the total number of lines
    this.numberOfLines = this.numberOfLinesTop + this.numberOfLinesBottom;

    //record the line line lineEndings
    this.lineEndings = lineEndings;

    //see if we are trying to use the card or not, and where it's living
    this.activated = false;
    this.onPosition = null;
    this.offPosition = null;

    //if the card is activated we remember the colors on the left and right
    this.leftColors = [];
    this.rightColors = [];
    for(var i=0;i<this.numberOfLines;i++){
      this.leftColors.push(null);
      this.rightColors.push(null);
    }

    this.cardBack = two.makeRoundedRectangle(0,0,cardWidth,cardHeight,15);
    this.cardBack.fill = 'lightgrey';
    this.cardBack.stroke = 'darkgrey';
    this.cardBack.linewidth = 3;

    this.center = [0,0];

    this.blackPaths = [];
    this.colorPaths = [];

    for(var i=0;i<this.numberOfLines;i++){
      if(i<this.numberOfLinesTop){
        var newBlackPath = two.makePath(xList[0],yList[i+1],xList[1],yList[i+1],xList[2],yList[this.lineEndings[i]+1],xList[3],yList[this.lineEndings[i]+1],open = true);
        var newColorPath = two.makePath(xList[0],yList[i+1],xList[1],yList[i+1],xList[2],yList[this.lineEndings[i]+1],xList[3],yList[this.lineEndings[i]+1],open = true);
      }
      else{
        var newBlackPath = two.makeCurve(xList[0],yList[i+1],xList[1],yList[i+1],xList[2],yList[this.lineEndings[i]+1],xList[3],yList[this.lineEndings[i]+1],open = true);
        var newColorPath = two.makeCurve(xList[0],yList[i+1],xList[1],yList[i+1],xList[2],yList[this.lineEndings[i]+1],xList[3],yList[this.lineEndings[i]+1],open = true);

      }

      newBlackPath.stroke = 'darkgrey';
      newBlackPath.fill = 'none';
      newBlackPath.linewidth = 2;
      newColorPath.stroke = 'none';
      newColorPath.fill = 'none';
      newColorPath.linewidth = 3;
      newColorPath.dashes[0] = 300;
      newColorPath.dashes.offset = 300;

      this.blackPaths.push(newBlackPath);
      this.colorPaths.push(newColorPath);
    }

    this.outerDiamond = two.makeRectangle(this.center[0],yList[0],14,14);
    this.outerDiamond.rotation = Math.PI/4;
    this.outerDiamond.fill = 'none';
    this.outerDiamond.stroke = 'black';

    this.innerDiamond = two.makeRectangle(this.center[0],yList[0],7,7);
    this.innerDiamond.rotation = Math.PI/4;
    this.innerDiamond.fill = 'none';
    this.innerDiamond.stroke = 'none'

    this.outerCircle = two.makeCircle(this.center[0],yList[this.numberOfLines+1],10);
    this.outerCircle.fill = 'none';
    this.outerCircle.stroke = 'black';

    this.innerCircle = two.makeCircle(this.center[0],yList[this.numberOfLines+1],5);
    this.innerCircle.fill = 'none';
    this.innerCircle.stroke = 'none';

    //Next we must figure out if we're an inversion. at the top and bottom
    var upperInversionCount = 0;
    for(var i=0;i<this.numberOfLinesTop;i++){
      for(var j=i;j<this.numberOfLinesTop;j++){
        if(this.lineEndings[j]<this.lineEndings[i]){
          upperInversionCount++;
        }
      }
    }
    var lowerInversionCount = 0;
    for(var i=0;i<this.numberOfLinesBottom;i++){
      for(var j=i;j<this.numberOfLinesBottom;j++){
        if(this.lineEndings[j+this.numberOfLinesTop]<this.lineEndings[i+this.numberOfLinesTop]){
          lowerInversionCount++;
        }
      }
    }
    if(upperInversionCount%2==1){
      this.innerDiamond.fill = 'black';
    }
    if(lowerInversionCount%2==1){
      this.innerCircle.fill = 'black';
    }

    this.card = two.makeGroup(this.cardBack, this.innerCircle, this.outerCircle, this.innerDiamond,this.outerDiamond);
    for(var i=0;i<this.numberOfLines;i++){
      this.card.add(this.blackPaths[i]);
      this.card.add(this.colorPaths[i]);
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
    //First figure out what color each line is
    if(this.onPosition==0){
      for(var i=0;i<this.numberOfLines;i++){
        this.leftColors[i] = colors[i];
      }
    }
    else{
      for(var i=0;i<this.numberOfLines;i++){
        this.leftColors[i] = activeSlots[this.onPosition-1].rightColors[i];
      }
    }
    //Then set the colors of the line and associated lines and balls
    for(var i=0;i<this.numberOfLines;i++){
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
    for(var i=0;i<this.numberOfLines;i++){
      this.colorPaths[i].stroke = 'none';
      this.colorPaths[i].dashes.offset = 300;
      this.leftColors[i] = null;
      this.rightColors[i] = null;
    }
    //decolorize the balls and lines too!
    //NOTE: 7 and 16 should be replaced by cardsInPlay and 2*(cardsInPlay+1)
    for(var i = this.onPosition;i<numberOfSlots + 1;i++){
      for(var j=0;j<this.numberOfLines;j++){
        powerLines[i][j].dashes.offset=1.5*halfLineLength;
        powerLines[i][j].stroke = 'none'
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
function deal(){
  for(var i=0;i<inactiveSlots.length;i++){
    if(inactiveSlots[i]==null){
      var topPermutation = generatePermutation(firstProduct);
      var bottomPermutation = generatePermutation(secondProduct);
      var permutation = topPermutation;
      for(var j=0;j<secondProduct;j++){
        permutation.push(bottomPermutation[j]+firstProduct);
      }
      inactiveSlots[i] = new Card(firstProduct,secondProduct,permutation);
      inactiveSlots[i].moveTo(inactivePositions[i]);
      inactiveSlots[i].offPosition = i;
      cardList[i] = inactiveSlots[i];
    }
  }
}
