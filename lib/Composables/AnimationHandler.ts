import BaseComponent from "./BaseComponent";

export default class AnimationHandler extends BaseComponent {
  constructor(context: any) {
    super(context);
  }

  protected keyframes: Keyframe[] | PropertyIndexedKeyframes;
  protected animOptions: number | KeyframeAnimationOptions;

  public setOpacityAnimation(duration?: number): void {
    this.keyframes = [
      { opacity: 0 },
      { opacity: 1 }
    ]

    this.animOptions = {
      duration: duration ?? 500
    }

    this.context.animate(this.keyframes, this.animOptions);
  }

  public setCustomAnimation(keyframes: typeof this.keyframes, animOptions: typeof this.animOptions): void {
    this.keyframes = keyframes;
    this.animOptions = animOptions;
    this.context.animate(this.keyframes, this.animOptions);
  }
}
