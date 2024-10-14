import AnimationHandler from "./Components/AnimationHandler";
import DisconnectHandler from "./Components/DisconnectHandler";
import EventHandler from "./Components/EventHandler";
import ShadowDOMHandler from "./Components/ShadowDOMHandler";
import StateHandler from "./Components/StateHandler";
import StyleHandler from "./Components/StyleHandler";
import SpeechSynthesisHandler from "./Components/SpeechSynthesisHandler";
import ReactiveElement from "./Classes/ReactiveElement";
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

class ReactiveElementLib {
  public static readonly AnimationHandler: typeof AnimationHandler = AnimationHandler;
  public static readonly DisconnectHandler: typeof DisconnectHandler = DisconnectHandler;
  public static readonly EventHandler: typeof EventHandler = EventHandler;
  public static readonly ShadowDOMHandler: typeof ShadowDOMHandler = ShadowDOMHandler;
  public static readonly StateHandler: typeof StateHandler = StateHandler;
  public static readonly StyleHandler: typeof StyleHandler = StyleHandler;
  public static readonly SpeechSynthesisHandler: typeof SpeechSynthesisHandler = SpeechSynthesisHandler;
  public static readonly ReactiveElement: typeof ReactiveElement = ReactiveElement;
  public static readonly defaultConfig: ISetupConfig = defaultConfig;
}

const DefineComponent = (tagName: string | IComponentOptions, componentClass?: CustomElementConstructor) => {
  if (typeof tagName === "string") {
    window.customElements.define(tagName, componentClass);
  }

  if (tagName["tag"] && tagName["component"]) {
    window.customElements.define(tagName["tag"], tagName["component"]);
  }
};

export {
  DisconnectHandler,
  StyleHandler,
  ShadowDOMHandler,
  StateHandler,
  AnimationHandler,
  EventHandler,
  ReactiveElement,
  SpeechSynthesisHandler,
  ICustomElement,
  ISetupConfig,
  IStyleConfig,
  IComponentOptions,
  defaultConfig,
  DefineComponent
};

export default ReactiveElementLib;
