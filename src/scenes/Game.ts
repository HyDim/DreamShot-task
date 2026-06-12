import { Container, Sprite, Assets } from "pixi.js";
import { SceneUtils } from "../core/App";

export default class Game extends Container {
  name = "Game";

  private bg!: Sprite;

  constructor(protected utils: SceneUtils) {
    super();
  }

  async load() {
    await this.utils.assetLoader.loadAssets();
  }

  async start() {
    this.bg = Sprite.from(Assets.get("background"));
    this.addChild(this.bg);

    this.onResize(window.innerWidth, window.innerHeight);
  }

  update(_delta: number) {
    // game loop — nothing yet
  }

  onResize(width: number, height: number) {
    if (!this.bg) return;

    const scaleX = width / this.bg.texture.width;
    const scaleY = height / this.bg.texture.height;
    const scale = Math.max(scaleX, scaleY);

    this.bg.scale.set(scale);
    this.bg.x = (width - this.bg.texture.width * scale) / 2;
    this.bg.y = (height - this.bg.texture.height * scale) / 2;
  }
}
