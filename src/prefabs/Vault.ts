import { Container, Sprite, Assets } from "pixi.js";
import { gsap } from "gsap";

export default class Vault extends Container {
  private doorClosed: Sprite;
  private doorOpen: Sprite;
  private handle: Sprite;
  private handleShadow: Sprite;
  private shine: Sprite;

  constructor() {
    super();

    // doorOpen goes first — it renders behind everything
    this.doorOpen = Sprite.from(Assets.get("doorOpen"));
    this.doorOpen.anchor.set(0.5);
    this.doorOpen.visible = false;

    // doorClosed on top — hides the treasure
    this.doorClosed = Sprite.from(Assets.get("doorClosed"));
    this.doorClosed.anchor.set(0.5);

    // handle shadow behind the handle itself
    this.handleShadow = Sprite.from(Assets.get("doorHandleShadow"));
    this.handleShadow.anchor.set(0.5);
    this.handleShadow.alpha = 0.5;

    // the interactive handle — player clicks near this
    this.handle = Sprite.from(Assets.get("doorHandle"));
    this.handle.anchor.set(0.5);

    // shine effect — sits behind the closed door, visible when door opens
    this.shine = Sprite.from(Assets.get("shine"));
    this.shine.anchor.set(0.5);
    this.shine.visible = false;
    this.shine.alpha = 0;

    this.addChild(this.doorOpen, this.shine, this.doorClosed, this.handleShadow, this.handle);

    this.layoutSprites();
  }

  private layoutSprites() {
    // door sprites are centered at 0,0 (the Vault container's origin)
    this.doorClosed.x = 0;
    this.doorClosed.y = 0;

    // open door is offset to the right (swings open)
    this.doorOpen.x = this.doorClosed.width * 0.55;
    this.doorOpen.y = 0;

    // handle + shadow sit at center of the closed door
    this.handle.x = 0;
    this.handle.y = 0;
    this.handleShadow.x = 4;
    this.handleShadow.y = 4;
  }

  async rotateHandle(direction: "CW" | "CCW", steps: number) {
    const degrees = steps * 60;
    const targetRotation = direction === "CW" ? degrees : -degrees;

    // GSAP rotates relative to current rotation
    await gsap.to([this.handle, this.handleShadow], {
      rotation: `+=${targetRotation * (Math.PI / 180)}`,
      duration: 0.4,
      ease: "back.out(1.4)",
    });
  }

  async openDoor() {
    this.doorOpen.visible = true;

    // fade out handle as door slides open
    gsap.to([this.handle, this.handleShadow], {
      alpha: 0,
      duration: 0.4,
    });

    await gsap.to(this.doorClosed, {
      x: this.doorClosed.width * 0.85,
      duration: 1.2,
      ease: "power2.inOut",
    });

    this.handle.visible = false;
    this.handleShadow.visible = false;
  }

  async closeDoor() {
    await gsap.to(this.doorClosed, {
      x: 0,
      duration: 1.0,
      ease: "power2.inOut",
    });

    this.doorOpen.visible = false;

    // restore handle for the next round
    this.handle.visible = true;
    this.handleShadow.visible = true;
    this.handle.alpha = 1;
    this.handleShadow.alpha = 0.5;
  }

  async spinCrazy() {
    await gsap.to([this.handle, this.handleShadow], {
      rotation: `+=${Math.PI * 8}`,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }

  async showShine() {
    this.shine.visible = true;
    this.shine.scale.set(0.5);

    await gsap.to(this.shine, {
      alpha: 1,
      duration: 0.6,
      ease: "power2.out",
    });

    // pulsing glow loop — runs until hideShine kills it
    gsap.to(this.shine.scale, {
      x: 1.2,
      y: 1.2,
      duration: 1.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  async hideShine() {
    gsap.killTweensOf(this.shine);
    gsap.killTweensOf(this.shine.scale);

    await gsap.to(this.shine, {
      alpha: 0,
      duration: 0.4,
    });

    this.shine.visible = false;
  }

  getHandleBounds() {
    return this.handle.getBounds();
  }
}
