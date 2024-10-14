import { ReactiveElement } from "../ReactiveElementLib";
import SharedState from "./SharedState";

export default class TabMouseHandler {
  public sharedState: SharedState;

  constructor(sharedState: SharedState) {
    this.sharedState = sharedState;
  }

  public observeTabMouse(): void {
    window.addEventListener("keydown", this.onTabKeydown);
    window.addEventListener("click", this.onMouseClick);
  }

  public onDisconnected(): void {
    window.removeEventListener("keydown", this.onTabKeydown);
    window.removeEventListener("click", this.onMouseClick);
  }

  protected onTabKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Tab") {
      // this.sharedState.getAllComponents()
      //   .then((components: Record<string, any>) => {
      //     for (const [key, component] of Object.entries(components)) {
      //       if (Array.isArray(component)) {
      //         component.forEach((instance: ReactiveElement) => {
      //           instance.classList.remove("using-mouse");
      //           instance.style.outline = "auto";
      //         });
      //       } else if (component instanceof ReactiveElement) {
      //         component.classList.remove("using-mouse");
      //         component.style.outline = "auto";
      //       }
      //     }
      //   })
      //   .catch((err) => console.error(err));
    }
  }

  protected onMouseClick = (): void => {
    // this.sharedState.getAllComponents()
    //   .then((components: Record<string, any>) => {
    //     for (const [key, component] of Object.entries(components)) {
    //       if (Array.isArray(component)) {
    //         component.forEach((instance: ReactiveElement) => {
    //           instance.classList.add("using-mouse");
    //           instance.style.outline = "none";
    //         });
    //       } else if (component instanceof ReactiveElement) {
    //         component.classList.add("using-mouse");
    //         component.style.outline = "none";
    //       }
    //     }
    //   })
    //   .catch((err) => console.error(err));
  }
}
