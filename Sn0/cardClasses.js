class Card {
  constructor(numberOfLines,lineEndings){
    this.numberOfLines = numberOfLines; //How many lines on the card
    this.lineEndings = lineEndings; //This is the permutation [a,b,c,...] of the line

    //see if we are trying to use the card or not, and where it's living
    this.activated = false;
    this.onPosition = null;
    this.offPosition = null;

    //if the card is activated we remember the colors on the left and right
    this.leftColors = [];
    this.rightColors = [];
    for(var i=0;i<numberOfLines;i++){
      this.leftColors.push(null);
      this.rightColors.push(null);
    }

    this.cardBack = two.makeRoundedRectangle(0,0,cardWidth,cardHeight,15);
    this.cardBack.fill = '#D3D3D3';
    this.cardBack.stroke = 'darkgrey';
    this.cardBack.linewidth = 3;

    this.center = [0,0];

    this.blackPaths = [];
    this.colorPaths = [];

    //create all the paths
    for(var i=0;i<numberOfLines;i++){
      var newBlackPath = two.makePath(xList[0],yList[i],xList[1],yList[i],xList[2],yList[this.lineEndings[i]],xList[3],yList[this.lineEndings[i]],open = true);
      newBlackPath.stroke = 'darkgrey';
      if(fixedOrder){
        newBlackPath.stroke = 'black';
      }
      newBlackPath.fill = 'none';
      newBlackPath.linewidth = 2;

      var newColorPath = two.makePath(xList[0],yList[i],xList[1],yList[i],xList[2],yList[this.lineEndings[i]],xList[3],yList[this.lineEndings[i]],open = true);
      newColorPath.stroke = 'none';
      newColorPath.fill = 'none';
      newColorPath.linewidth = 3;
      newColorPath.dashes[0] = 300;
      newColorPath.dashes.offset = 300;

      this.blackPaths.push(newBlackPath);
      this.colorPaths.push(newColorPath);
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
    if(fixedOrder){
      this.onPosition = findInsertionPoint(this.offPosition);
      activeSlots.splice(this.onPosition,0,this);
      insertCard(this.onPosition);
    }
    else{
      this.onPosition = activeSlots.length
      this.moveTo(activePositions[this.onPosition]);
      activeSlots.push(this);
    }
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
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
function checkIfCardActive(card){
  for(var x=0;x<activeCards.length;x++){
    if(arraysEqual(activeCards[x],card)){
      return true;
    }
  }
  return false;
}
function notIdentity(permutation){
  for(var i=0;i<yPositions-1;i++){
    if(permutation[i]!=i){
      return true;
    }
  }
  return false
}
function generateCardData(){
  if(allowRepeats&allowIdentity){
    return generatePermutation(yPositions-1);
  }
  if(allowRepeats){
    while(true){
      newPermutation = generatePermutation(yPositions-1);
      if(notIdentity(newPermutation)){
        return newPermutation;
      }
    }
  }
  while(true){
    newPermutation = generatePermutation(yPositions-1);
    if(!checkIfCardActive(newPermutation)){
      if(allowIdentity||notIdentity(newPermutation)){
        activeCards.push(newPermutation);
        return newPermutation;
      }
    }
  }
}
function shiftColor(base, change, direction) {
  const colorRegEx = /^\#?[A-Fa-f0-9]{6}$/;

  // Missing parameter(s)
  if (!base || !change) {
    return '000000';
  }

  // Invalid parameter(s)
  if (!base.match(colorRegEx) || !change.match(colorRegEx)) {
    return '000000';
  }

  // Remove any '#'s
  base = base.replace(/\#/g, '');
  change = change.replace(/\#/g, '');

  // Build new color
  let newColor = '';
  for (let i = 0; i < 3; i++) {
    const basePiece = parseInt(base.substring(i * 2, i * 2 + 2), 16);
    const changePiece = parseInt(change.substring(i * 2, i * 2 + 2), 16);
    let newPiece = '';

    if (direction === 'add') {
      newPiece = (basePiece + changePiece);
      newPiece = newPiece > 255 ? 255 : newPiece;
    }
    if (direction === 'sub') {
      newPiece = (basePiece - changePiece);
      newPiece = newPiece < 0 ? 0 : newPiece;
    }

    newPiece = newPiece.toString(16);
    newPiece = newPiece.length < 2 ? '0' + newPiece : newPiece;
    newColor += newPiece;
  }

  return '#' + newColor;
}

function deal(){
  for(var i=0;i<inactiveSlots.length;i++){
    //This loop checks if we've already used the card.
    if(inactiveSlots[i]==null){
      newPermutation = generateCardData();
      inactiveSlots[i] = new Card(yPositions - 1,newPermutation);
      //If we're doing fixed order, use opacity to give a gradient to the cards
      if(fixedOrder){
        console.log(inactiveSlots[i].cardBack.fill);
        adding = (25*i).toString(16);
        adding = adding + '0000';
        while (adding.length < 6) {
          adding = "0" + adding;
        }
        adding = '#'+adding;
        console.log(adding);
        inactiveSlots[i].cardBack.fill = shiftColor(inactiveSlots[i].cardBack.fill,adding,'sub');
        console.log(inactiveSlots[i].cardBack.fill);
      }
      inactiveSlots[i].moveTo(inactivePositions[i]);
      inactiveSlots[i].offPosition = i;
      cardList[i] = inactiveSlots[i];
    }
  }
}
