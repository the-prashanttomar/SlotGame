import { Graphics } from '@pixi/graphics';
import { Sprite } from '@pixi/sprite';
import { TextStyle, Text } from '@pixi/text';
import { MainLogic } from '../components/mainLogic';
import { Scene } from '../core/scene';
import { default as data } from './../data';
import { Container } from '@pixi/display';
import * as PIXI from 'pixi.js';
const TEXT_STYLE = new TextStyle({
  fontSize: 36,
  fill: 0xffffff,
  stroke: 0x000000,
  strokeThickness: 5,
  align: 'center',
});

const NUMBER_FORMAT = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

export class GameScene extends Scene {
  private machine: MainLogic;
  private introContainer: Container;
  private loadingBar: Container;
  private GameContainer: Container;
  private buttonContainer: Container;
  private reelContainer: Container;
  public spin_button: Sprite;
  public clickContinue: Sprite;
  private clickContinueScale: number = 1;
  private clickContinueDirection: number = 1;
  /**
   * to load assets
   */
  public preload(): void {
    this.loader.add('template', './assets/background2.jpg');
    this.loader.add('intro', './assets/splash.jpg');
    this.loader.add('clickContinue', './assets/click_continue.png');
    this.loader.add('bottomBar', './assets/bottom_platfarm.png');
    this.loader.add('spin_button', './assets/buttons/spin_button.png');
    this.loader.add('transparent_bg', './assets/transparent_bg.png');
    this.loader.add('scoretxt', './assets/score.png');
    this.loader.add('linetxt', './assets/line.png');
    this.loader.add('inputBox', './assets/input.png');
    this.loader.add('wintxt', './assets/win.png');
    this.loader.add('img10', './assets/Symbol/img10.png');
    for (let i = 0; i < data.symbols.length; i++) {
      this.loader.add(data.symbols[i].num, data.symbols[i].filename);
    }
  }
  /**
   * to create assets
   */
  public create(): void {
    this.GameContainer = new Container();
    this.addChildAt(this.GameContainer, 0);
    const template = Sprite.from('template');
    this.GameContainer.addChildAt(template, 0);
    this.createIntroElements()
    this.showIntroText()
  }
  /**
   * to create game intro elements
   */
  private createIntroElements(): void {
    this.introContainer = new Container();
    this.addChildAt(this.introContainer, 1);
    const intro = Sprite.from('intro');
    this.introContainer.addChild(intro);
    this.loadingBar = new Container();
    this.loadingBar.position.set(455, 910);
    this.introContainer.addChild(this.loadingBar);
    this.startLoadingBar()
  }
  /**
   * used to play progress bar
   */
  private startLoadingBar(): void {
    const progressBarWidth = 1000;
    const progressBarHeight = 60;
    const progressBar = new Graphics();
    progressBar.beginFill(0xfcc41a);
    progressBar.drawRoundedRect(0, 0, 0, progressBarHeight, 30);
    this.loadingBar.addChild(progressBar);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          progressBar.visible = false;
          this.clickContinue.visible = true;
        }, 200);
      }
      this.setProgress(progress, progressBar, progressBarWidth, progressBarHeight);
    }, 5);
  }
  /**
   * update progress bar
   */
  private setProgress(progress: any, progressBar: any, progressBarWidth: any, progressBarHeight: any): void {
    const progressWidth = (progress / 100) * progressBarWidth;
    progressBar.clear();
    progressBar.beginFill(0xa69a20);
    progressBar.drawRoundedRect(0, 0, progressWidth, progressBarHeight, 30);
  }
  /**
   * click to continue text and and made it clickable
   */
  private showIntroText(): void {
    this.clickContinue = Sprite.from('clickContinue');
    this.introContainer.addChild(this.clickContinue);
    this.clickContinue.visible = false;
    this.clickContinue.anchor.set(0.5, 0.5);
    this.clickContinue.position.set(980, 940);
    //@ts-ignore
    this.clickContinue.interactive = true;
    //@ts-ignore
    this.clickContinue.buttonMode = true;
    //@ts-ignore
    this.clickContinue.on('pointerdown', () => {
      this.introContainer.visible = false
      this.clickContinue = null
      this.createConsoleButtons()

      this.createReels()
    });
  }
  /**
   * animating the click to comtinue text
   */
  private zoomInTxt(): void {
    this.clickContinueScale += 0.002 * this.clickContinueDirection;
    this.clickContinue.scale.set(this.clickContinueScale);
    if (this.clickContinueScale < 1 || this.clickContinueScale >= 1.05) {
      this.clickContinueDirection *= -1;
    }
  }
  /**
   * create basegame console buttons
   */
  private createConsoleButtons(): void {
    this.buttonContainer = new Container();
    this.GameContainer.addChild(this.buttonContainer);
    const bottomBar = Sprite.from('bottomBar');
    bottomBar.position.set(65, 845);
    this.buttonContainer.addChild(bottomBar);
    this.spin_button = Sprite.from('spin_button');
    this.spin_button.position.set(805, 938)
    //@ts-ignore
    this.spin_button.interactive = true;
    //@ts-ignore
    this.spin_button.buttonMode = true;
    //@ts-ignore
    this.spin_button.on('pointerdown', () => {
      this.spin();
    });
    this.buttonContainer.addChild(this.spin_button);

    const scoretxt = Sprite.from('scoretxt');
    scoretxt.position.set(922, 1010);
    this.buttonContainer.addChild(scoretxt);

    const linetxt = Sprite.from('linetxt');
    linetxt.position.set(335, 988);
    this.buttonContainer.addChild(linetxt);

    const inputBox = Sprite.from('inputBox');
    inputBox.position.set(270, 1020);
    this.buttonContainer.addChild(inputBox);

    const inputBox2 = Sprite.from('inputBox');
    inputBox2.position.set(1430, 1020);
    this.buttonContainer.addChild(inputBox2);

    const wintxt = Sprite.from('wintxt');
    wintxt.position.set(1485, 988);
    this.buttonContainer.addChild(wintxt);

  }
  /**
   * create reels and its containers
   */
  private createReels(): void {
    this.reelContainer = new Container();
    this.reelContainer.position.set(370, 140);
    this.GameContainer.addChild(this.reelContainer);
    const transparent_bg = Sprite.from('transparent_bg');
    this.reelContainer.addChild(transparent_bg);
    this.machine = new MainLogic(1146, 690, 5);
    this.machine.position.set(25, 30);
    this.reelContainer.addChild(this.machine);
  }
  public update(deltaTime: number): void {
    if (this.machine) {
      this.machine.update(deltaTime);
    }
    if (this.clickContinue) {
      this.zoomInTxt();
    }
    if (this.machine && this.machine.getTotalSpin()) {
      this.disableSpin();
    }
  }

  private spin(): void {
    this.machine.spinReels();
  }

  public disableSpin(): void {
    //@ts-ignore
    this.spin_button.interactive = false;
  }
  public enableSpin(): void {
    //@ts-ignore
    this.spin_button.interactive = true;
  }
}
