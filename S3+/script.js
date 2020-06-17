var elem = document.getElementById('draw-shapes');
var params = { fullscreen: true };
var two = new Two(params).appendTo(elem);

//Save the width and the height of the screen
var screenWidth = screen.width;
var screenHeight = screen.height;
console.log(screenWidth);
console.log(screenHeight);

//use this to compute the card size:
var cardWidth = screenWidth/9.107;
var cardHeight = 5*cardWidth/3;

var animationQueue = [];  //keeps animations in order
var cardList = []; //keeps track of cards on the table

//Positions of things relative to the origin
var yList = [-.76*cardHeight/2,-.12*cardHeight/2,.52*cardHeight/2,cardHeight/2.5];
var xList = [-cardWidth/2,-cardWidth/6,cardWidth/6,cardWidth/2];

//Save the colors of each row as global variables. (top,middle,bottom)
var colors = ['purple', 'blue','red'];

//it might be useful to store the next open stop as a global variable
var activeSlots = [];
var inactiveSlots = [null,null,null,null,null,null];

//and maybe store the open and closed positions
var activeY = 0.1953125*screenHeight;
var inactiveY = 0.5859375*screenHeight;
var activePositions = [
  [4*cardWidth/3,activeY],
  [8*cardWidth/3,activeY],
  [12*cardWidth/3,activeY],
  [16*cardWidth/3,activeY],
  [20*cardWidth/3,activeY],
  [24*cardWidth/3,activeY]
];
var inactivePositions = [
  [4*cardWidth/3,inactiveY],
  [8*cardWidth/3,inactiveY],
  [12*cardWidth/3,inactiveY],
  [16*cardWidth/3,inactiveY],
  [20*cardWidth/3,inactiveY],
  [24*cardWidth/3,inactiveY]
]


deal();
var powerBalls = makeBalls();
var powerLines = makeLines();
for (var i=0;i<3;i++){
  powerBalls[0][i].fill=colors[i];
  animationQueue.push([growBalls,0]);
}

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
    //console.log(animationQueue[0][0]);
    animationQueue[0][0]();
  }
  else{
    checkWinCondition();
  }
  two.update();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/*TO DO:
  -We have an animation queue, but there is some lag with removing cards, might be worth streamlining things
  -It might be worth working out a different animation scheme at some point.
*/
