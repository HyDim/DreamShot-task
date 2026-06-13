import { Container, Sprite, Assets, FederatedPointerEvent } from "pixi.js";
import { SceneUtils } from "../core/App";
import Vault from "../prefabs/Vault";
import CombinationLock from "../core/CombinationLock";
import { wait } from "../utils/misc";

export default class Game extends Container {
  name = "Game";

  private bg!: Sprite;
  private vault!: Vault;
  private lock!: CombinationLock;
  private isAnimating = false;

  constructor(protected utils: SceneUtils) {
    super();
  }

  async load() {
    await this.utils.assetLoader.loadAssets();
  }

  async start() {
    this.bg = Sprite.from(Assets.get("background"));
    this.vault = new Vault();
    this.lock = new CombinationLock();

    this.addChild(this.bg, this.vault);

    // make the whole stage interactive for click detection
    this.bg.eventMode = "static";
    this.bg.cursor = "pointer";
    this.bg.on("pointertap", (e: FederatedPointerEvent) => this.onTap(e));

    this.onResize(window.innerWidth, window.innerHeight);
  }

  private async onTap(e: FederatedPointerEvent) {
    if (this.isAnimating) return;

    // determine direction: click left of vault center = CCW, right = CW
    const handleBounds = this.vault.getHandleBounds();
    const centerX = handleBounds.x + handleBounds.width / 2;
    const direction = e.globalX > centerX ? "CW" : "CCW";

    this.isAnimating = true;

    // rotate the handle one step
    await this.vault.rotateHandle(direction, 1);

    // check the input against the combination
    const result = this.lock.input(direction);

    if (result === "correct") {
      await this.onWin();
    } else if (result === "wrong") {
      await this.onFail();
    }

    this.isAnimating = false;
  }

  private async onWin() {
    await this.vault.openDoor();
    await this.vault.showShine();
    await wait(5);
    await this.vault.hideShine();
    await this.vault.closeDoor();

    this.lock.generate();
  }

  private async onFail() {
    await this.vault.spinCrazy();

    this.lock.generate();
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
