import FadeTransition from "./FadeTransition";
import {
  DisconnectHandler,
  ShadowDOMHandler,
  StyleHandler,
  StateHandler,
  SpeechSynthesisHandler,
  AnimationHandler,
  EventHandler,
  ICustomElement,
  ISetupConfig,
  defaultConfig
} from "../ReactiveElementLib";
import SharedState from "./SharedState";

/**
 * @description
 * SharedState is speacial object that simply shares the reference of all registered components through member variable defined in CustomHTMLElement base class.
 *
 * @example
 * console.log(this.sharedState.components); // SharedState { components:{...} }
 */
export const sharedState = new SharedState(document.querySelector("#app"));

export interface UpdateChangedOptions {
  name: string;
  attrName: string;
  oldValue: any;
  newValue: any;
  callback: CallableFunction;
  timeout?: number;
}

export type Watcher = Record<string, (newValue: any, oldValue: any) => void>;

export default class ReactiveElement<T_State extends object = any, T_Props extends any = any> extends HTMLElement implements ICustomElement {
  public $root?: ShadowRoot;
  public animationHandler?: AnimationHandler;
  public componentID: string;
  public components: Record<string, ReactiveElement>;
  public data: T_State;
  public disconnectHandler: DisconnectHandler;
  public eventHandler?: EventHandler;
  public eventHandlers: Record<string, Map<string | symbol, EventListener>>;
  public fadeTransition: FadeTransition;
  public props: T_Props;
  public refProxy: T_State;
  public shadowDOM?: ShadowDOMHandler;
  public stateHandler?: StateHandler<T_State>;
  public speechSynthesisHandler?: SpeechSynthesisHandler;
  public styles?: StyleHandler;
  public template: HTMLTemplateElement;
  public templateContent: string;
  public watch: Watcher;
  public devMode: boolean;
  public html: HTMLElement;
  public refs: Record<string, HTMLElement & NodeListOf<HTMLElement> & ReactiveElement>;
  public sharedState: SharedState;
  public componentConfig: ISetupConfig<T_Props>;
  public controller: AbortController;

  constructor(setupConfig?: ISetupConfig<T_Props>, components?: {}) {
    super();
    this.data = {} as T_State;
    this.html = document.querySelector("html");

    if (setupConfig && setupConfig.props) {
      this.props = setupConfig.props;
    }

    sharedState.setComponent<ReactiveElement>(this, this.tagName.toLowerCase());
    this.constructComponent(setupConfig, components);

    ReactiveElement.setCount();
  }

  public static count: number = 0;
  private static setCount(): void {
    this.count++;
  }
  public static getCount(): number {
    return this.count;
  }

  //#region METHODS
  /**
   * @description
   * This method is responsible for bulding whole component from scratch.
   */
  private constructComponent(setupConfig?: ISetupConfig, components?: {}): void {
    this.setupShadow();

    this.eventHandlers = {};
    this.controller = new AbortController();
    this.devMode = false;

    this.template = document.createElement("template");

    if (this.render() !== "") {
      this.template.innerHTML = this.render();
    } else if (this.templateContent !== "") {
      this.template.innerHTML = this.templateContent;
    }

    this.$root.appendChild(this.template.content.cloneNode(true));

    if (setupConfig) {
      this.componentConfig = setupConfig;
    } else {
      this.componentConfig = defaultConfig;
    }

    this.components = components ?? {};
    this.componentID = Math.random().toString(16).slice(2);

    this.sharedState = sharedState;
  }

  /**
   * @description
   * This method is responsible for attaching shadow and defining $root member variable!
   */
  private setupShadow(): void {
    this.attachShadow({ mode: "open" });
    this.$root = this.shadowRoot;
  }

  /**
   * @description
   * This method is responsible for defining web component's different instance objects and properties!
   */
  private setupHandlers(setupConfig?: ISetupConfig): void {
    this.disconnectHandler = new DisconnectHandler(this);

    this.setupConfig(setupConfig);

    this.stateHandler = new StateHandler(this);
    this.stateHandler.setInitialState();

    this.eventHandler = new EventHandler(this);
  }

  private setupConfig(setupConfig?: ISetupConfig): void {
    if (setupConfig) {
      const { animations, styles, shadowDOM, devMode, setFadeInTransition, speechAPI } = setupConfig;

      if (animations) {
        this.animationHandler = new AnimationHandler(this);

        if (animations.setOpacityAnimation) {
          this.animationHandler.setFadeAnimation(animations.duration);
        }
      }

      if (styles) {
        this.styles = new StyleHandler(this);

        if (styles.adds && styles.adds.margins) {
          this.styles.setupMargins();
        }

        if (styles.links && styles.links.length >= 1) {
          for (let i = 0; i < styles.links.length; ++i) {
            let styleID = styles.links[i];
            this.sharedState.setLinkToRoot(this, styleID);
          }
        }

        if (styles.css || styles.sass) {
          this.$root.adoptedStyleSheets = [ this.styles.hostStylesheet ];

          if (styles.css) {
            this.styles.setupCSS(styles.css);
          } else if (styles.sass) {
            this.styles.setupSASS(styles.sass);
          } else if (styles.css && styles.sass) {
            this.styles.setupCSS(styles.css);
            this.styles.setupSASS(styles.sass);
          }

          if (this.styles.cssStylesheet) {
            this.$root.adoptedStyleSheets.push(this.styles.cssStylesheet);
          }

          if (this.styles.sassStylesheet) {
            this.$root.adoptedStyleSheets.push(this.styles.sassStylesheet);
          }
        }
      }

      if (shadowDOM) {
        this.shadowDOM = new ShadowDOMHandler(this);
      }

      if (devMode) {
        console.log("Dev mode is turned on...");
      }

      if (setFadeInTransition && setFadeInTransition.value) {
        this.fadeTransition = new FadeTransition(this.$root, setFadeInTransition.duration ?? 1000);
      }

      if (speechAPI) {
        this.speechSynthesisHandler = new SpeechSynthesisHandler(this);
      }
    }
  }

  /**
   * @description
   * This method is CustomElements API's lifecycle method, that is called when element is added to document!
   *
   * @warning
   * Never override this method unless you need to do so, by default you won't need to do that!
   */
  private connectedCallback(): void {
    this.setupHandlers(this.componentConfig);
    this.onConnected();
    this.events();
  }

  /**
   * @description
   * This method is CustomElements API's lifecycle method, that is called when element is remove from document!
   *
   * @warning
   * Never override this method, unless you need to do so, by default you won't need to do that!
   */
  private disconnectedCallback(): void {
    this.disconnectHandler.destroy();
    this.onDisconnected();
  }

  /**
   * @description
   * This static getter that returns array of string values is CustomElements API's built in getter which returns element attributes that need to be dynamic!
   */
  public static get observedAttributes(): string[] {
    return [];
  }

  /**
   * @description
   * This method is lifycycle method of CustomElements API, and is called whenever returned attribute value from getter observedAttributes is changed!
   */
  public attributeChangedCallback(name: string, oldValue: any, newValue: any): void {
    if (this.devMode) {
      console.log(name, oldValue, newValue);
    }
  }

  /**
   * @description
   * This method is responsible for just updating dynamic attributes much cleaner!
   */
  public updateChanged(options: UpdateChangedOptions): void {
    const { name, attrName, oldValue, newValue, callback, timeout } = options;

    if (name === attrName) {
      if (oldValue !== newValue) {
        setTimeout(() => {
          callback();
        }, timeout);
      }
    }
  }

  /**
   * @description
   * This method is called in connectedCallback lifecycle method after component is built, and every handler is ready!
   */
  public onConnected(): void {
  }

  /**
   * @description
   * This method is called in disconnectedCallback lifecycle method after component is dismounted or destroyed, to clean some objects maybe, or defined events!
   */
  public onDisconnected(): void {
  }

  /**
   * @description
   * This method is responsible for setting component template content!
   */
  public render(): string {
    return '';
  }

  /**
   * @description
   * This is just a field method where you can define events, it is called after onConnected lifecycle method
   */
  public events(): void {
  }

  /**
   * @description
   * This is the field method where can clean objects, or remove events that were defined by yourself
   * Because in general, if you use EventHandler class' subscribe method to subscribe event, it is automatically removes the references and event listeners for ya,
   * and also you can remove single event listeners, or remove them all by yourself, if you encounter cases where you need to remove event listeners.
   * It is done - using unsubscribe and unsubscribeEvents methods.
   */
  public cleanUp(): void {
  }

  /**
   * @description
   * This method just removes element from Document
   */
  public destroy(): void {
    this.remove();
  }

  /**
   * @description
   * This method hides element itself, by adding display to none, and setting visibility to hidden.
   */
  public hideImmediate(): void {
    this.style.opacity = "0";
    this.style.display = "none";
    this.style.visibility = "hidden";
  }

  /**
   * @description
   * This method hides element little bit slowly, with transition
   */
  public hide(): void {
    this.style.opacity = "0";
    setTimeout(() => {
      this.hideImmediate();
    }, 1000);
  }

  /**
   * @description
   * This method shows element, if it hidden
   */
  public show(): void {
    this.style.opacity = "1";
    this.style.display = "";
    this.style.visibility = "visible";
  }

  /**
   * @description
   * Just logs message to console, so that you are just calling it throght component
   */
  public log(message: any, ...optionalParams: any[]): void {
    console.log(message, ...optionalParams);
  }

  /**
   * @description
   * Just debounces some action that should have some timing for performing final task.
   */
  public debounce(func: Function, delay: number): (...args: any[]) => void {
    let timerId: any;

    return (...args: any[]): void => {
      const context: any = this;

      clearTimeout(timerId);

      timerId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  }
  //#endregion
}
