class Button{
  constructor(text,color){

    this.title = text;
    this.color = color;
    this.buttonBack = two.makeRoundedRectangle(0,0,buttonWidth,buttonHeight,15);
    this.buttonBack.fill = '#'+color;
    this.buttonBack.stroke = 'lightgrey';

  }
}
