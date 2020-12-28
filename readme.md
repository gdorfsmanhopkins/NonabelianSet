Here's a brief description of the code.

I think S3 and S4 are what's currently on my website, but I think newCase is the most up to date.  restructuring is a work in progress that I thought might be useful because I think it was kinda dumb the way I made it, but it might be more work than it's worth to rebuild.  I'll briefly describe the convoluted structure of the whole thing, although most the function names are self-explanatory maybe?  There's also varying degrees of commenting

index.html: sets up the website and calls the scripts

script.js: I guess this is like the brain of the whole operation.  It calculates all the positions of the slots, it's where you can choose how many cards in a hand and how large your group is.  It also holds the animation queue and runs the animation loop.  The loop runs once every time the screen refreshes, and goes through the animation queue one by one to do the next step in the animation for each thing in the queue (and checks if there's a win).  It also hangs out waiting on mouse clicks, and remembers which cards are where (in lists...the cards themselves are objects...)

cardClasses.js: I did this in an 'object oriented' way, so each card is an object.  It remembers what it looks like (i.e., what permutation it is, whether it has been played), and has a bunch of built in functions, (colorizing its lines, moving around, drawing and deleting itsef, etc...).  I think one can also deal here.

boardLayout.js: This puts all the dots and lines on the board (not on the cards).  It also discards cards and starts a new round.  For some reason checkWinCondition is here too.

animationFunctions.js: Exactly what it sounds like.  This is the main thing I may want to rehash, because everything can only animate one at a time.  I think the better javascripty way to do this is with arrow functions (I think this is what I was trying to do with restructuring, but I was having trouble keeping track of order of stuff).

menuScreen.js: Does nothing.

two.min.js: I use two.js for my 2d animation stuff, because it sort of has it all built in (shapes and lines and such).  Canvas or svg might have been better, but it seems to be working just fine.  You can find the documentation here: https://two.js.org/

rainbowvis.js: This just creates a gradient of colors that are organized between 1 and 100, so as I add more lines I can just have 5 colors be 0,20,40,60,80 or whatever instead of having to pick RGB.
