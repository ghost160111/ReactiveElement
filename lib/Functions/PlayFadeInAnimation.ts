import { ReactiveElement } from "../ReactiveElementLib";
import animate from "../Utils/Animate";

export const PlayFadeInAnimation = (targetNode: HTMLElement | ReactiveElement, duration?: number): void => {
  animate({
    node: targetNode,
    keyframes: [
      { opacity: 0 },
      { opacity: 1 }
    ],
    options: {
      easing: "ease",
      duration: duration ?? 1000
    }
  });
}
