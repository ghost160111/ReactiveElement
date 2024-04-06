import PopupContentHandler from "../Components/PopupContentHandler";
import {
  BaseHandler,
  ShadowDOMHandler,
  StyleHandler,
  StateHandler,
  AnimationHandler,
  EventHandler,
  ICustomElement,
  ISetupConfig
} from "../CustomElement";

declare interface UpdateChangedOptions {
  name: string;
  attrName: string;
  oldValue: any;
  newValue: any;
  callback: CallableFunction;
  timeout?: number;
}

declare class CustomHTMLElement extends HTMLElement implements ICustomElement {
  declare public base: BaseHandler;
  declare public styles?: StyleHandler;
  declare public shadowDOM?: ShadowDOMHandler;
  declare public stateHandler?: StateHandler;
  declare public animationHandler?: AnimationHandler;
  declare public eventHandler?: EventHandler;
  declare public popupContentHandler?: PopupContentHandler;
  declare public $root?: ShadowRoot;
  declare public template: HTMLTemplateElement;
  declare public componentID: string;
  declare public eventHandlers: Record<string, Map<string | symbol, EventListener>>;
  declare protected componentConfig: ISetupConfig;
  declare protected controller: AbortController;
  declare protected components: {};
  declare protected devMode: boolean;

  declare public _data: {}
  declare public data: {};
  declare public refProxy: {}

  constructor(setupConfig?: ISetupConfig, components?: {});

  /**
   * @description
   * This method is responsible for bulding whole component from scratch.
   */
  private constructComponent(setupConfig?: ISetupConfig, components?: {}): void;

  /**
   * @description
   * This method is responsible for attaching shadow and defining $root member variable!
   */
  private setupShadow(): void;

  /**
   * @description
   * This method is responsible for defining web component's
   * different instance objects and properties!
   */
  private setupConfig(setupConfig: ISetupConfig): void;

  /**
   * @description
   * This method is CustomElements API's lifecycle method, that is
   * called when element is added to document!
   */
  private connectedCallback(): void;

  /**
   * @description
   * This method is CustomElements API's lifecycle method, that is called
   * when element is remove from document!
   */
  private disconnectedCallback(): void;

  /**
   * @description
   * This static getter that returns array of string values is CustomElements API's
   * built in getter which returns element attributes that need to be dynamic!
   */
  public static get observedAttributes(): string[];

  /**
   * @description
   * This method is lifycycle method of CustomElements API, and is called whenever
   * returned attribute value from getter observedAttributes is changed!
   */
  public attributeChangedCallback(name: string, oldValue: any, newValue: any): void;

  /**
   * @description
   * This method is responsible for just updating dynamic attributes much cleaner!
   */
  public updateChanged(options: UpdateChangedOptions): void;

  /**
   * @description
   * This method is called in connectedCallback lifycycle method after component is built,
   * and every handler is ready!
   */
  public onConnected(): void;

  /**
   * @description
   * This method is called in disconnectedCallback lifycycle method after component is dismounted
   * or destroyed, to clean some objects maybe, or defined events!
   */
  public onDisconnected(): void;

  /**
   * @description
   * This method is responsible for setting component template content!
   */
  public render(): string;

  /**
   * @description
   * This is just a field method where you can define events, it is called after
   * onConnected lifecycle method
   */
  public events(): void;

  /**
   * @description
   * This is the field method where can clean objects, or
   * remove events that were defined by yourself
   */
  public cleanUp(): void;

  /**
   * @description
   * This method just removes element from Document
   */
  public destroy(): void;

  /**
   * @description
   * This method hides element itself, by adding display to
   * none, and setting visibility to hidden.
   */
  public hideImmediate(): void;

  /**
   * @description
   * This method hides element little bit slowly, with transition
   */
  public hide(): void;

  /**
   * @description
   * This method shows element, if it hidden
   */
  public show(): void;
}
