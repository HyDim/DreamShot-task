import { Container, Sprite, Assets } from "pixi.js";
import { gsap } from "gsap";

export default class Vault extends Container {
  private doorClosed: Sprite;
  private doorOpen: Sprite;
  private handle: Sprite;
  private handleShadow: Sprite;

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

    this.addChild(this.doorOpen, this.doorClosed, this.handleShadow, this.handle);

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

    // slide closed door to the right to reveal treasure
    await gsap.to(this.doorClosed, {
      x: this.doorClosed.width * 0.85,
      duration: 1.2,
      ease: "power2.inOut",
    });
  }

  async closeDoor() {
    await gsap.to(this.doorClosed, {
      x: 0,
      duration: 1.0,
      ease: "power2.inOut",
    });

    this.doorOpen.visible = false;
  }

  async spinCrazy() {
    await gsap.to([this.handle, this.handleShadow], {
      rotation: `+=${Math.PI * 8}`,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }

  getHandleBounds() {
    return this.handle.getBounds();
  }
}
