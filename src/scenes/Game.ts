import { Container, Sprite, Assets } from "pixi.js";
import { SceneUtils } from "../core/App";
import Vault from "../prefabs/Vault";

export default class Game extends Container {
  name = "Game";

  private bg!: Sprite;
  private vault!: Vault;

  constructor(protected utils: SceneUtils) {
    super();
  }

  async load() {
    await this.utils.assetLoader.loadAssets();
  }

  async start() {
    this.bg = Sprite.from(Assets.get("background"));
    this.vault = new Vault();

    this.addChild(this.bg, this.vault);

    this.onResize(window.innerWidth, window.innerHeight);
  }

  update(_delta: number) {
    // game loop — will be used for timer later
  }

  onResize(width: number, height: number) {
    if (!this.bg) return;

    // cover-fit the background
    const scaleX = width / this.bg.texture.width;
    const scaleY = height / this.bg.texture.height;
    const scale = Math.max(scaleX, scaleY);

    this.bg.scale.set(scale);
    this.bg.x = (width - this.bg.texture.width * scale) / 2;
    this.bg.y = (height - this.bg.texture.height * scale) / 2;

    // scale and center the vault
    const vaultScale = Math.min(width / 800, height / 600) * 0.7;
    this.vault.scale.set(vaultScale);
    this.vault.x = width / 2;
    this.vault.y = height / 2;
  }
}
