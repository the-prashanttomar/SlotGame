import { Container } from '@pixi/display';
import { BlurFilter } from '@pixi/filter-blur';
import { Graphics } from '@pixi/graphics';
import { Grid } from './grid';

export class Reel extends Container {
  private static readonly reelMaxSpeed: number = 80;
  private static readonly inTime: number = 30;
  private static readonly outTime: number = 30;
  private static readonly visibleTiles: number = 3;
  private static readonly totalTiles: number = 5;

  public id: number;
  public tiles: Grid[];

  private realWidth: number;
  private realHeight: number;
  private tileHeight: number;
  private container: Container;
  private time: number;
  private timeStop: number;
  private spinning: boolean = false;
  private stopping: boolean = false;
  private blurFilter: BlurFilter;

  private finalOffset: number;
  private finalPosition: number;

  constructor(width: number, height: number, id: number) {
    super();

    this.realWidth = width;
    this.realHeight = height;
    this.tileHeight = height / Reel.visibleTiles; 
    this.id = id;
    const rectMask = new Graphics();
    rectMask.beginFill(0);
    rectMask.drawRect(0, 0, width, height);
    rectMask.endFill();
    this.addChild(rectMask);

    this.container = new Container();
    this.container.mask = rectMask;
    this.addChild(this.container);

    this.tiles = [];
    for (let i = 0; i < Reel.totalTiles; i++) {
      const tile = new Grid(this.realWidth, this.tileHeight);
      tile.position.set(0, this.tileHeight * i - this.tileHeight);
      this.container.addChild(tile);
      this.tiles.push(tile);
    }
    this.blurFilter = new BlurFilter(0, 1, window.devicePixelRatio);
    this.filters = [this.blurFilter];
  }

  public spin(): void {
    this.time = 0;
    this.spinning = true;
    this.blurFilter.blurYFilter.strength = 0;
    this.filters = [this.blurFilter];
  }

  public stop(): void {
    this.finalOffset = 1;
    this.finalPosition = this.realHeight - this.tileHeight - this.container.children[0].y;
    this.stopping = true;
    this.timeStop = this.time;
  }

  public update(delta: number): void {
    if (!this.spinning) return;
    this.time += delta;
    const speed = this.getSpeed(delta);
    for (const tile of this.tiles) {
      tile.y += speed;
    }

    this.blurFilter.blurYFilter.strength = speed * 0.3;

    const limitY: number = this.realHeight + this.tileHeight;
    for (let i: number = this.tiles.length - 1; i >= 0; i--) {
      if (this.container.y + this.tiles[i].y > limitY) {
        this.tiles[i].y = this.container.children[0].y - this.tileHeight;
        this.container.addChildAt(this.tiles[i], 0);
        this.tiles[i].swapSymb();
      }
    }
  }

  private getSpeed(delta: number): number {
    let speed = delta * Reel.reelMaxSpeed;

    if (this.stopping) {
      const n = 1 - (this.time - this.timeStop) / Reel.outTime;
      const r = this.easeIn(n);
      speed = (this.finalOffset - r) * this.finalPosition;
      this.finalOffset = r;
      if (n <= 0) {
        this.onComplete();
      }
    } else if (this.time < Reel.inTime) {
      const n = this.time / Reel.inTime;
      speed *= this.easeIn(n);
    }

    return speed;
  }

  private onComplete(): void {
    this.stopping = false;
    this.spinning = false;
    this.reorderTiles();
    // @ts-ignore
    this.emit('spincomplete', { target: this, id: this.id });
    this.filters = null;
  }

  private reorderTiles(): void {
    this.tiles.sort(this.compareGrid.bind(this));
  }

  private compareGrid(a: Grid, b: Grid): boolean {
    return this.container.getChildIndex(a) > this.container.getChildIndex(b);
  }

  private easeIn(n: number): number {
    const s = 1.70158;
    return n * n * ((s + 1) * n - s);
  }
}
