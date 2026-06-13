import { Container, Text, Graphics } from "pixi.js";

export default class TimerDisplay extends Container {
  private label: Text;
  private bg: Graphics;
  private elapsed = 0;
  private running = false;

  constructor() {
    super();

    this.bg = new Graphics();
    this.bg.beginFill(0x000000, 0.6);
    this.bg.drawRoundedRect(0, 0, 120, 50, 8);
    this.bg.endFill();

    this.label = new Text("0.0s", {
      fontFamily: "Courier New, monospace",
      fontSize: 24,
      fill: 0x00ff88,
      fontWeight: "bold",
    });
    this.label.resolution = 2;
    this.label.x = 12;
    this.label.y = 12;

    this.addChild(this.bg, this.label);
  }

  start() {
    this.elapsed = 0;
    this.running = true;
    this.updateText();
  }

  stop() {
    this.running = false;
  }

  resetTimer() {
    this.elapsed = 0;
    this.running = true;
    this.updateText();
  }

  update(delta: number) {
    if (!this.running) return;

    // PIXI ticker delta is in frames (60fps = delta ~1), convert to seconds
    this.elapsed += delta / 60;
    this.updateText();
  }

  private updateText() {
    this.label.text = `${this.elapsed.toFixed(1)}s`;
  }
}
