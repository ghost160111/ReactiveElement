import { ReactiveElement } from "../ReactiveElementLib";
import BaseComponent from "./BaseComponent";

export type SpeechAPILangList = keyof {
  "en-US": string;
  "ru-RU": string;
}

HTMLInputElement.prototype["reset"] = function() {
  HTMLInputElement.prototype.value = "";
}

export default class SpeechSynthesisHandler extends BaseComponent<ReactiveElement> {
  public elementsToRead: NodeListOf<HTMLElement>;
  public controller: AbortController; // in case you need to fire and destroy each possible reference for events

  constructor(context: ReactiveElement) {
    super(context);
    this.controller = new AbortController();
    this.performSpeak = this.performSpeak.bind(this);
    this.cancelSpeak = this.cancelSpeak.bind(this);
  }

  public speak(text: string): void {
    const msg = new SpeechSynthesisUtterance(text);

    switch (this.context.lang) {
      case "ru":
        msg.lang = "ru-RU";
        break;
      case "uz":
        msg.lang = "en-EN";
        break;
      case "oz":
        msg.lang = "en-EN";
        break;
      default:
        return; // stops execution
    }

    window.speechSynthesis.speak(msg);
  }

  public stop(): void {
    window.speechSynthesis.cancel();
  }

  public observeElementsToRead(): void {
    this.elementsToRead = this.context.$root.querySelectorAll<HTMLElement>("[ref-speech]");

    if (this.elementsToRead && this.elementsToRead.length > 0) {
      this.elementsToRead.forEach((el: HTMLElement) => {
        el.addEventListener("mouseover", this.performSpeak, { signal: this.controller.signal });
        el.addEventListener("mouseout", this.cancelSpeak, { signal: this.controller.signal });
        el.addEventListener("focus", this.performSpeak, { signal: this.controller.signal });
      });
    }
  }

  public performSpeak(event: any): void {
    let target: HTMLElement = event.target;

    if (target instanceof HTMLInputElement) {
      if (target.placeholder) {
        this.speak(target.placeholder);
      } else if (target.value) {
        this.speak(target.value);
      }
    } else {
      this.speak(target.textContent);
    }

    target.style.outline = "auto";
  }

  public cancelSpeak(event: any): void {
    window.speechSynthesis.cancel();
    event.target.style.outline = "";
  }

  public removeEvents(): void {
    try {
      this.elementsToRead.forEach((el: HTMLElement) => {
        el.removeEventListener("mouseover", this.performSpeak);
        el.removeEventListener("mouseout", this.cancelSpeak);
        el.removeEventListener("focus", this.performSpeak);
      });
    } catch (err) {
      if (this.context.devMode) {
        console.error(err);
      }
    }
  }
}
