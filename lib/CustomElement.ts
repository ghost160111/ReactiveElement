import AnimationHandler from "./Components/AnimationHandler";
import BaseHandler from "./Components/BaseHandler";
import EventHandler from "./Components/EventHandler";
import ShadowDOMHandler from "./Components/ShadowDOMHandler";
import StateHandler from "./Components/StateHandler";
import StyleHandler from "./Components/StyleHandler";
import CustomHTMLElement from "./Classes/CustomHTMLElement";
import ICustomElement from "./Interfaces/ICustomElement";
import ISetupConfig from "./Interfaces/ISetupConfig";
import IStyleConfig from "./Interfaces/IStyleConfig";
import IComponentOptions from "./Interfaces/IComponentOptions";

const defaultConfig: ISetupConfig = {
  styles: {
  },
  shadowDOM: true,
  animations: {
    setOpacityAnimation: true
  }
}

class CustomElement {
  public static AnimationHandler = AnimationHandler;
  public static BaseHandler = BaseHandler;
  public static EventHandler = EventHandler;
  public static ShadowDOMHandler = ShadowDOMHandler;
  public static StateHandler = StateHandler;
  public static StyleHandler = StyleHandler;
  public static CustomHTMLElement = CustomHTMLElement;
  public static defaultConfig: ISetupConfig = defaultConfig;
}

const DefineComponent = (tagName: string | IComponentOptions, componentClass: CustomElementConstructor) => {
  if (typeof tagName === "string") {
    window.customElements.define(tagName, componentClass);
  }

  if (tagName["tag"] && tagName["component"]) {
    window.customElements.define(tagName["tag"], tagName["component"]);
  }
};

export {
  BaseHandler,
  StyleHandler,
  ShadowDOMHandler,
  StateHandler,
  AnimationHandler,
  EventHandler,
  CustomHTMLElement,
  ICustomElement,
  ISetupConfig,
  IStyleConfig,
  IComponentOptions,
  defaultConfig,
  DefineComponent
};

export default CustomElement;
