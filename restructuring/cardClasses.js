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

    this.cardBack = two.makeRoundedRectangle(0,0,Game.cardWidth,Game.cardHeight,15);
    this.cardBack.fill = 'lightgrey';
    this.cardBack.stroke = 'black';

    this.center = [0,0];

    this.blackPaths = [];
    this.colorPaths = [];

    //create all the paths
    for(var i=0;i<numberOfLines;i++){
      var newBlackPath = two.makePath(Game.xList[0],Game.yList[i],Game.xList[1],Game.yList[i],Game.xList[2],Game.yList[this.lineEndings[i]],Game.xList[3],Game.yList[this.lineEndings[i]],open = true);
      newBlackPath.stroke = 'black';
      newBlackPath.fill = 'none';
      newBlackPath.linewidth = 2;

      var newColorPath = two.makePath(Game.xList[0],Game.yList[i],Game.xList[1],Game.yList[i],Game.xList[2],Game.yList[this.lineEndings[i]],Game.xList[3],Game.yList[this.lineEndings[i]],open = true);
      newColorPath.stroke = 'none';
      newColorPath.fill = 'none';
      newColorPath.linewidth = 3;
      newColorPath.dashes[0] = 300;
      newColorPath.dashes.offset = 300;

      this.blackPaths.push(newBlackPath);
      this.colorPaths.push(newColorPath);
    }

    this.outerCircle = two.makeCircle(this.center[0],Game.yList[this.numberOfLines],10);
    this.outerCircle.fill = 'none';
    this.outerCircle.stroke = 'black';

    this.innerCircle = two.makeCircle(this.center[0],Game.yList[this.numberOfLines],5);
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
  moveTo(position,start = performance.now(),duration=250){
    const from = this.center;
    const to = position;
    const card = this;
    const isWaiting = false;
    animationQ.push({
      from: from,
      to: position,
      card: card,
      start: start,
      duration: duration,
      isWaiting: isWaiting,
      callback: (t) => {
        var newX = from[0]*(1-t) + to[0]*t;
        var newY = from[1]*(1-t) + to[1]*t;
        card.card.translation.set(newX,newY);
      },
      finish: () => {
        card.card.translation.set(to[0],to[1]);
      }
    })
    this.center = position;
  }
  colorize(stagger = 0){
    //First figure out what color each line is
    //let's do each row individually
    for(var i=0;i<Game.yPositions-1;i++){
      //First figure out cardlines:
      var color;
      if(this.onPosition==0){
        color = Game.colors[i];
      }
      else{
        color = Game.activeSlots[this.onPosition-1].rightColors[i];
      }

      //Now find the objects we need to adjust:
      const path = this.colorPaths[i];
      const line = Game.powerLines[this.onPosition][i];
      const leftBall = Game.powerBalls[2*this.onPosition+1][i];
      const rightBall = Game.powerBalls[2*this.onPosition+2][this.lineEndings[i]];

      //set the necessary colors
      this.leftColors[i] = color;
      this.rightColors[this.lineEndings[i]] = color;
      path.stroke = color;
      line.stroke = color;
      leftBall.fill = color;
      rightBall.fill = color;

      //finally do all the animations:
      const startTime = stagger + performance.now();
      animationQ.push({
        start: startTime,
        duration: 100,
        callback: (t) => {
          line.dashes.offset = 50*(1-t);
        },
        finish: () => {
          line.dashes.offset = 0;
        }
      })
      animationQ.push({
        start: startTime+100,
        duration: 100,
        callback: (t) => {
          leftBall.radius = 5*t;
        },
        finish: () => {
          leftBall.radius = 5;
        }
      })
      animationQ.push({
        start: startTime+200,
        duration: 200,
        callback: (t) => {
          path.dashes.offset = 300*(1-t);
        },
        finish: () => {
          path.dashes.offset = 0;
        }
      })
      animationQ.push({
        start: startTime+400,
        duration: 100,
        callback: (t) => {
          rightBall.radius = 5*t;
        },
        finish: () => {
          rightBall.radius = 5;
          //this is the last step in the animation, so set animation to false!
          this.coloring = false;
        }
      })
    }
  }
  decolorize(){
    for(var i=0;i<this.numberOfLines;i++){
      this.colorPaths[i].stroke = 'none';
      this.colorPaths[i].dashes.offset = 300;
      this.leftColors[i] = null;
      this.rightColors[i] = null;
    }
    //decolorize the balls and lines too!
    for(var i = this.onPosition;i<Game.sizeOfHand + 1;i++){
      for(var j=0;j<this.numberOfLines;j++){
        Game.powerLines[i][j].dashes.offset=50;
        Game.powerLines[i][j].stroke = 'none'
      }
    }
    for(var i=2*this.onPosition+1;i<2*Game.sizeOfHand+2;i++){
      for(var j=0;j<this.numberOfLines;j++){
        Game.powerBalls[i][j].radius = 0;
        Game.powerBalls[i][j].fill = 'none';
      }
    }
  }
  activate(){
    this.activated = true;
    this.onPosition = Game.activeSlots.length;
    this.moveTo(Game.activePositions[this.onPosition]);
    Game.activeSlots.push(this);
    Game.inactiveSlots[this.offPosition] = null;
    this.colorize(250);
  }
  deactivate(){
    this.activated = false;
    Game.inactiveSlots[this.offPosition] = this;
    this.decolorize();
    this.moveTo(Game.inactivePositions[this.offPosition]);
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
/*
//This class has all the cards, and deal should live here!
class Deck {
  constructor(yPositions){
    this.numberOfLetters = yPositions - 1;
    this.letters = [];
    for(var i=0;i<this.numberOfLetters;i++){this.letters.push(i)}
    this.permutations = this.generatePermutations(this.letters);
    console.log(this.permutations);
  }
  generatePermutations(letters){
    //base case 1
    if(letters.length==0){
      return [];
    }
    //base case 2
    if(letters.length==1){
      return [letters];
    }

    //Otherwise let's make an empty list:
    var perms = []
    //inductive step:
    for(var i=0;i<letters.length;i++){
      var l = letters[i];
      console.log("l is ",l," and i  is ",i);
      //extract the letters
      var remainingLetters = []
      for(var j=0;j<letters.length;j++){
        if(j!=i){
          remainingLetters.push(letters[j]);
        }
      }
      var newPerm = [];
      newPerm.push(l);
      var restPerm = this.generatePermutations(remainingLetters);
      for(var k=0;k<restPerm.length;k++){
        newPerm.push(restPerm[i]);
      }
      perms.push(newPerm);
    }
    return perms;
  }
}
*/
//Board has a bunch of public variables that take care of things
class Board {
  constructor(sizeOfHand = 7,yPositions = 4){
    //yPositions includes the parity marker, so generally 1 larger than the permutation size
    this.sizeOfHand = sizeOfHand;
    this.yPositions = yPositions;

    //How big are our cards going to be?
    this.cardWidth = 3*screenWidth/(4*this.sizeOfHand + 2);
    this.cardHeight = 5*this.cardWidth/3;

    //The cards on the table should likely be saved by the game as well.
    this.cardList = [];
    this.powerBalls;
    this.powerLines;

    //Positions of things relative to the origin
    this.yList = [];
    for(var i=0;i<this.yPositions;i++){
      this.yList.push(-.4*this.cardHeight + .8*i*this.cardHeight/(this.yPositions-1));
    }
    this.xList = [-this.cardWidth/2,-this.cardWidth/4,this.cardWidth/4,this.cardWidth/2];

    //Save the colors of each row as game attribute
    this.colors = [];
    for(var i=0;i<this.yPositions-1;i++){
      var j = Math.floor(100*i/(yPositions-1));
      //console.log('0x'+rainbow.colourAt(j));
      this.colors.push('#'+rainbow.colourAt(j));
    }
    //The following lists store positions of cards (globally!)
    this.activeSlots = [];
    this.inactiveSlots = [];
    for(var i=0;i<this.sizeOfHand;i++){
      this.inactiveSlots.push(null);
    }

    //also store the active and inactive positions.  We add one to each list to help with some computations of lines and balls later
    this.activeY = 0.2*screenHeight;
    this.inactiveY = 0.6*screenHeight;

    this.activePositions = [];
    this.inactivePositions = [];
    for(var i=0;i<this.sizeOfHand+1;i++){
      var nextX = this.cardWidth*(1+4*i/3);
      this.activePositions.push([nextX,this.activeY]);
      this.inactivePositions.push([nextX,this.inactiveY]);
    }
  }
  makeBalls(){
    var balls = [];
    var groups = [];
    for (var i=0;i<2*this.sizeOfHand+2;i++){
      var nextColumn = [];
      var ballGroup = two.makeGroup();
      for(var k=0;k<this.yPositions-1;k++){
        var newCircle = two.makeCircle(0,this.yList[k],0);
        newCircle.stroke = 'none';
        newCircle.fill = 'none';
        nextColumn.push(newCircle);
        ballGroup.add(newCircle);
      }
      this.moveBalls(i,ballGroup);
      balls.push(nextColumn);
    }
    return balls;
  }
  moveBalls(column,ballGroup){
    if((column%2)==0){
      var i = column/2;
      ballGroup.translation.set(this.activePositions[i][0] + this.cardWidth/2 - 4*this.cardWidth/3,this.activeY);
    }
    else{
      i = (column-1)/2;
      ballGroup.translation.set(this.activePositions[i][0] - this.cardWidth/2 ,this.activeY);
    }
  }
  makeLines(){
    var halfLineLength = (this.xList[0]+4*this.cardWidth/3)-this.xList[3];
    var lines = []
    for(var i=0;i<this.sizeOfHand+1;i++){
      var nextColumn = []
      var lineGroup = two.makeGroup();
      for(var j=0;j<this.yPositions-1;j++){
        var newLine = two.makePath(-1*halfLineLength,this.yList[j],0,this.yList[j],open=true);
        newLine.stroke = 'none';
        newLine.fill = 'none';
        newLine.linewidth = 5;
        newLine.dashes[0] = 50;
        newLine.dashes.offset = 50;
        lineGroup.add(newLine);
        nextColumn.push(newLine);
      }
      this.moveLines(i,lineGroup);
      lines.push(nextColumn);
    }
    return lines;
  }
  moveLines(column,lineGroup){
    lineGroup.translation.set(this.inactivePositions[column][0] - this.cardWidth/2,this.activeY);
  }
  cleanUpActive(i){
    freeze = true;
    time = performance.now();

    //first put unfreeze in the animation queue,
    animationQ.push({
      start: time,
      duration: 500*(this.activeSlots.length - i - 1),
      callback: (t) => {},
      finish: () => {freeze = false}
    })

    //the do the actual cleanup (animation and color swaps)
    this.activeSlots.splice(i,1);
    for(var j = i;j<this.activeSlots.length;j++){
      for(var k=0;k<this.yPositions-1;k++){
        this.activeSlots[j].colorPaths[k].dashes.offset=300;
      }
      this.activeSlots[j].moveTo(this.activePositions[j],time + 100*(j-i)); //staggering start is a nice effect
      this.activeSlots[j].onPosition = j;
      this.activeSlots[j].colorize(350+500*(j-i));
    }
  }
  checkWinCondition(){
    var n = this.activeSlots.length;
    if(n>2){
      var winning = true;
      for(var i=0;i<this.yPositions-2;i++){
        if(this.activeSlots[n-1].rightColors[i]!=this.colors[i]){
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
              this.activeSlots[i].cardBack.opacity = 1-t;
            }
          },
          finish: () => {
            for(var i=0;i<n;i++ ){
              this.activeSlots[i].cardBack.opacity = 0;
            }
          }
        });
        //then fade balls and make the lines skinny
        animationQ.push({
          start: time + 1500,
          duration: 1000,
          callback: (t) => {
            for(var j=0;j<this.yPositions-1;j++){
              //fade theballs
              for(var i=1;i<2*n;i++){
                this.powerBalls[i][j].opacity = 1-t;
              }
              //thin the lines
              for(var i=0;i<this.sizeOfHand-1;i++){
                this.powerLines[i][j].linewidth = 5*(1-t) + 3*t;
              }
            }
            for(var i=0;i<n;i++){
              this.activeSlots[i].outerCircle.opacity = 1-t;
              this.activeSlots[i].innerCircle.opacity = 1-t;
            }
          },
          finish: () => {
            for(var j=0;j<this.yPositions-1;j++){
              //fade theballs
              for(var i=1;i<2*n;i++){
                this.powerBalls[i][j].opacity = 0;
              }
              //thin the lines
              for(var i=0;i<this.sizeOfHand-1;i++){
                this.powerLines[i][j].linewidth = 3;
                this.powerLines[i][j].opacity = 1;
              }
            }
            for(var i=0;i<n;i++){
              this.activeSlots[i].outerCircle.opacity = 0;
              this.activeSlots[i].innerCircle.opacity = 0;
            }

          }
        });
        //Finally, fade the paths,lines, and remaining balls):
        animationQ.push({
          start: time+5000,
          duration: 1000,
          callback: (t) =>{
            for(var j = 0; j<this.yPositions-1;j++){
              //balls:
              this.powerBalls[0][j].opacity = 1-t;
              this.powerBalls[2*n][j].opacity = 1-t;

              //paths:
              for(var i=0;i<n;i++){
                this.activeSlots[i].blackPaths[j].opacity = 0;
                this.activeSlots[i].colorPaths[j].opacity = 1-t;
              }

              //lines:
              for(var i=0;i<this.sizeOfHand-1;i++){
                this.powerLines[i][j].opacity = 1-t;
              }
            }
          },
          finish: () =>{
            for(var j = 0; j<this.yPositions-1;j++){
              //balls:
              this.powerBalls[0][j].opacity = 0;
              this.powerBalls[2*n][j].opacity = 0;

              //paths:
              for(var i=0;i<n;i++){
                this.activeSlots[i].blackPaths[j].opacity = 0;
                this.activeSlots[i].colorPaths[j].opacity = 0;
              }

              //lines:
              for(var i=0;i<this.sizeOfHand-1;i++){
                this.powerLines[i][j].opacity = 0;
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
            for(var i=0;i<this.activeSlots.length;i++){
              this.activeSlots[i].destroy();
            }
            //and start the next round
            this.newRound();
          }
        });
      }
    }
  }
  newRound(){
    this.activeSlots = [];
    this.deal();
    this.powerBalls = this.makeBalls();
    this.powerLines = this.makeLines();
    for (var i=0;i<this.yPositions-1;i++){
      //console.log(colors[i]);
      const ball = this.powerBalls[0][i];
      ball.fill=this.colors[i]
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
  deal(){
    const time = performance.now();
    for(var i=0;i<this.inactiveSlots.length;i++){
      if(this.inactiveSlots[i]==null){
        var newPermutation = generatePermutation(this.yPositions-1);
        this.inactiveSlots[i] = new Card(this.yPositions - 1,newPermutation);
        this.inactiveSlots[i].moveTo(this.inactivePositions[i],time+100*i);
        this.inactiveSlots[i].offPosition = i;
        this.cardList[i] = this.inactiveSlots[i];
      }
    }
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
