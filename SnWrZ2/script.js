var rainbow = new Rainbow(); //use this to generate colors programatically

var elem = document.getElementById('draw-shapes');
var params = { fullscreen: true };
var two = new Two(params).appendTo(elem);

//Save the width and the height of the screen
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;

//How big is a hand?
var numberOfSlots = 8;

//how many y positions do we need?
//for Sn, we need n+1
var yPositions = 4;

//How fast do cards fade when you win?
var fadingSpeed = .05;

var animationQueue = [];  //keeps animations in order
var cardList = []; //keeps track of cards on the table

//The following lists store positions of cards (globally!)
var activeSlots = [];
var inactiveSlots = [];

//Keeps track of the coordinates of the card placements
var activePositions = [];
var inactivePositions = [];

//This is the y coordinates of those placements
var activeY = 0.2*screenHeight;
var inactiveY = 0.6*screenHeight;

//These are the balls at the end of cards and lines connecting cards.  They will need to be initialized every time I reset.
var powerBalls;
var powerLines;

//global variables  They will be set in the initialize function.
var cardWidth;
var cardHeight;
var yList;
var xList;
var colors;


function initialize(){
    //First make the background
    var background = two.makeRoundedRectangle(screenWidth/2,screenHeight/2,2*screenWidth,2*screenHeight);
    background.fill = 'black';

    //use this to compute the card size:
    cardWidth = 3*screenWidth/(4*numberOfSlots + 2);
    cardHeight = 5*cardWidth/3;

    //Positions of things relative to the origin
    yList = [];
    for(var i=0;i<yPositions;i++){
      yList.push(-.4*cardHeight + .8*i*cardHeight/(yPositions-1));
    }
    xList = [-cardWidth/2,-cardWidth/4,cardWidth/4,cardWidth/2];

    //Save the colors of each row as global variables. (top to bottom)
    colors = [];
    for(var i=0;i<yPositions-1;i++){
      j = Math.floor(100*i/(yPositions-1));
      //console.log('0x'+rainbow.colourAt(j));
      colors.push('#'+rainbow.colourAt(j));
    }

    //Initially no cards are active, so deal knows to put a card there.
    activeSlots = [];
    inactiveSlots = [];
    for(var i=0;i<numberOfSlots;i++){
      inactiveSlots.push(null);
    }

    //initialize coordinates of card placements
    activePositions = [];
    inactivePositions = [];
    for(var i=0;i<numberOfSlots+1;i++){
      nextX = cardWidth*(1+4*i/3);
      activePositions.push([nextX,activeY]);
      inactivePositions.push([nextX,inactiveY]);
    }

    //Deal
    deal();

    //make our balls and lines
    halfLineLength = (xList[0]+4*cardWidth/3)-xList[3]; //This gives me line lengths, which the cards like to access too
    powerBalls = makeBalls();
    powerLines = makeLines();
    powerDottedLines = makeDottedLines();

    //Grow the first column of balls
    for (var i=0;i<yPositions-1;i++){
      //console.log(colors[i]);
      powerBalls[0][i].fill=colors[i];
      animationQueue.push([growBalls,0]);
    }
}

//Here are settings that allow you to adjust the game a bit
/*
var settings = QuickSettings.create(screenWidth/10,8*screenHeight/10,"Settings");
settings.addNumber("How many lines?",1,50,3,1,function setLines(value){yPositions=value+1});
settings.addNumber("Size of hand?",1,20,8,1,function setHandSize(value){numberOfSlots = value});
settings.addButton("Apply Changes",function applyChanges(){initialize()});
*/

function on_mouse_down(event){
    if(animationQueue.length==0){
    coords = click_to_plane_coords( event );
    x = coords[0];
    y = coords[1];

    //first we have to save all the centers before we move things around
    centerList = []
    for (i = 0;i<cardList.length;i++){
      centerList.push([cardList[i].center[0],cardList[i].center[1]]);
    }
    for (i=0;i<cardList.length;i++){
      if(-1*cardWidth/2<x-centerList[i][0] && x-centerList[i][0]<cardWidth/2&&-1*cardHeight/2<y-centerList[i][1] && y-centerList[i][1]<cardHeight/2){
        if(cardList[i].onClick()){
          cleanUpActive(cardList[i].onPosition);
        }
      }
    }
  }
}
function click_to_plane_coords( event ) {
	let rect = event.target.getBoundingClientRect();
	let x = event.clientX;
	let y = event.clientY;


	return [ x, y ];
}
elem.addEventListener( "mousedown", on_mouse_down );

//Let's put the animation stuff in here
function animate(){
  if(animationQueue.length > 0){
    animationQueue[0][0]();
  }
  else{
    checkWinCondition();
  }
  two.update();
  requestAnimationFrame(animate);
}

initialize();
requestAnimationFrame(animate);

/*TO DO:
  -We have an animation queue, but there is some lag with removing cards, might be worth streamlining things
  -It might be worth working out a different animation scheme at some point.
*/
