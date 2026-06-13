import { Container, Sprite, Assets, FederatedPointerEvent } from "pixi.js";
import { SceneUtils } from "../core/App";
import Vault from "../prefabs/Vault";
import CombinationLock from "../core/CombinationLock";
import TimerDisplay from "../prefabs/TimerDisplay";
import { wait } from "../utils/misc";

export default class Game extends Container {
  name = "Game";

  private bg!: Sprite;
  private vault!: Vault;
  private lock!: CombinationLock;
  private timer!: TimerDisplay;
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
    this.timer = new TimerDisplay();

    this.addChild(this.bg, this.vault, this.timer);

    this.bg.eventMode = "static";
    this.bg.cursor = "pointer";
    this.bg.on("pointertap", (e: FederatedPointerEvent) => this.onTap(e));

    this.timer.start();
    this.onResize(window.innerWidth, window.innerHeight);
  }

  private async onTap(e: FederatedPointerEvent) {
    if (this.isAnimating) return;

    const handleBounds = this.vault.getHandleBounds();
    const centerX = handleBounds.x + handleBounds.width / 2;
    const direction = e.globalX > centerX ? "CW" : "CCW";

    this.isAnimating = true;

    await this.vault.rotateHandle(direction, 1);

    const result = this.lock.input(direction);

    if (result === "correct") {
      await this.onWin();
    } else if (result === "wrong") {
      await this.onFail();
    }

    this.isAnimating = false;
  }

  private async onWin() {
    this.timer.stop();
    await this.vault.openDoor();
    await this.vault.showShine();
    await wait(5);
    await this.vault.hideShine();
    await this.vault.closeDoor();

    this.lock.generate();
    this.timer.resetTimer();
  }

  private async onFail() {
    await this.vault.spinCrazy();

    this.lock.generate();
    this.timer.resetTimer();
  }

  update(delta: number) {
    this.timer?.update(delta);
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

    // position timer at top-left with some padding
    this.timer.x = 20;
    this.timer.y = 20;
  }
}
