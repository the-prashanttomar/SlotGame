import { Container } from '@pixi/display';
import { Reel } from './reel';



export class MainLogic extends Container {
  private reels: Reel[];
  private currentReel: number;
  private symbolScale:number = 1;
  private symbolDirection:number = 1;
  private Syminterval:any;
  private totalSPins:number = 0;
  

  constructor(width: number, height: number, numberOfReels: number = 5) {
    super();

    this.reels = [];
    const slicedWidth = width / numberOfReels;
    for (let i = 0; i < numberOfReels; i++) {
      const reel = new Reel(slicedWidth, height, i);
      reel.position.set(slicedWidth * i, 0);
      this.addChild(reel);
      this.reels.push(reel);
      // @ts-ignore
      reel.on('spincomplete', this.onReelSpinComplete.bind(this));
    }
  }

  public spinReels(): void {
    this.totalSPins++
    this.currentReel = 0;
    let timeout = 0;
    for (const reel of this.reels) {
      setTimeout(reel.spin.bind(reel), timeout);
      timeout += 300;
    }
    setTimeout(this.stopReels.bind(this), 1500);
  }

  public stopReels(): void {
    this.reels[0].stop();
  }

  public update(delta: number): void {
    for (const reel of this.reels) {
      reel.update(delta);
    }
  }

  private onReelSpinComplete(): void {
    this.currentReel++;
    if (this.currentReel < this.reels.length) {
      this.reels[this.currentReel].stop();
    } else {
      if(this.totalSPins === 3){
        this.animateSymbol();
        setTimeout(() => {
          alert("Reload The game to spin again")
        }, 2000);
      }
    }
  }

  private animateSymbol(): void {
    let totalSymbols = 0;
    for(let i=0 ;i<this.reels.length; i++){
      for(let j=1;j<4;j++){
        const symNum = this.reels[i].tiles[j].sprite._texture.textureCacheIds[0]
        if(symNum === "sym10" || symNum === "sym12" || symNum === "sym3"){
          totalSymbols++
          this.Syminterval = setInterval(() => {
            this.zoomInTxt(this.reels[i].tiles[j].sprite)
          }, 40/totalSymbols);
        }
      }
    }
  }
  private zoomInTxt(symbol:any):void {
    this.symbolScale -= 0.002 * this.symbolDirection;
    symbol.scale.set(this.symbolScale);
    if (this.symbolScale <= 0.95 || this.symbolScale > 1) {
      this.symbolDirection *= -1;
    }
  }
  public killInterval():void {
    clearInterval(this.Syminterval);
  }
  public getTotalSpin():boolean{
    if(this.totalSPins ===3){
      return true;
    }
    else{
      return false;
    }
  }
}
