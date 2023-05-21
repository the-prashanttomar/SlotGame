import { Texture } from '@pixi/core';
import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { default as data } from '../data';

export class Grid extends Container {
  public id: number;
  public sprite: Sprite;

  constructor(width: number, height: number) {
    super();
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.position.set(width * 0.5, height * 0.5);
    this.addChild(this.sprite);
    this.swapSymb();
  }
  public swapSymb(): void {
    this.id = Math.floor(Math.random() * data.symbols.length);

    if (data.symbols[this.id].texture === null) {
      data.symbols[this.id].texture = Texture.from(data.symbols[this.id].filename,);
    }

    this.sprite.texture = data.symbols[this.id].texture;
  }
}
