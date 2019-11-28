var rainbow = new Rainbow(); //use this to generate colors programatically

var elem = document.getElementById('draw-shapes');
var params = { fullscreen: true };
var two = new Two(params).appendTo(elem);

//Save the width and the height of the screen
var screenWidth = screen.width;
var screenHeight = screen.height;

//Ever element in animationQ must have the following:
//start: time when in starts
//duration: length of time the animations runs
//callback(): what happens at each step of the animation
//finish(): Adjusts to the final state of the animation
var animationQ = [];

//Hopefully I can eliminate this variable eventually:
var freeze = false;

//There should be only one Board at a time, called Game, which is referenced ubiquitously
//This is likely not the best practice...

var Game = new Board(7,5);
Game.newRound();


function on_mouse_down(event){
  if(!freeze){
    coords = click_to_plane_coords( event );
    x = coords[0];
    y = coords[1];

    //first we have to save all the centers before we move things around
    centerList = []
    for (i = 0;i<Game.cardList.length;i++){
      centerList.push([Game.cardList[i].center[0],Game.cardList[i].center[1]]);
    }
    for (i=0;i<Game.cardList.length;i++){
      if(-1*Game.cardWidth/2<x-centerList[i][0] && x-centerList[i][0]<Game.cardWidth/2&&-1*Game.cardHeight/2<y-centerList[i][1] && y-centerList[i][1]<Game.cardHeight/2){
        if(Game.cardList[i].onClick()){
          Game.cleanUpActive(Game.cardList[i].onPosition);
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
  time = performance.now();
  for(i=0;i<animationQ.length;i++){
    //t is the percentage of the animation that is finished
    const t = (time-animationQ[i].start)/animationQ[i].duration;
    //console.log(t);
    if(t>1){
      var finisher = animationQ[i];
      animationQ.splice(i,1);
      i-=1;
      finisher.finish();
    }
    else if (t>=0){
      animationQ[i].callback(t);
    }
  }
  if(animationQ.length==0){
    Game.checkWinCondition();
  }
  two.update();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/*TO DO:
  -We have an animation queue, but there is some lag with removing cards, might be worth streamlining things
  -It might be worth working out a different animation scheme at some point.
*/
