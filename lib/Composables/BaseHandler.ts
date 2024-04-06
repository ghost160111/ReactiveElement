import BaseComponent from "./BaseComponent";

export default class BaseHandler extends BaseComponent {
  constructor(context: any) {
    super(context);
  }

  public setupTemplate(): void {
    this.context.template = document.createElement("template");
    this.context.template.innerHTML = this.context.render();
    this.context.$root.appendChild(this.context.template.content.cloneNode(true));
  }

  public destroy(): void {
    this.destroyEvents();
    this.destroyStyles();
    this.destroyShadowDOM();
    this.destroyStateHandler();
    this.destroyAnimationHandler();
    this.destroyEventHandler();
    this.context.base = null;

    if (this.context.devMode) {
      this.logDestroyedObjects();
    }
  }

  protected destroyEvents(): void {
    if (this.context.cleanUp) {
      this.context.cleanUp();
      this.context.eventHandlers = {};
    }
  }

  protected destroyStyles(): void {
    if (this.context.styles) {
      this.context.styles.disconnectedCallback();
      this.context.styles = null;
    }
  }

  protected destroyShadowDOM(): void {
    if (this.context.shadowDOM) {
      this.context.shadowDOM.disconnectedCallback();
      this.context.shadowDOM = null;
    }
  }

  protected destroyStateHandler(): void {
    if (this.context.stateHandler) {
      this.context.stateHandler.disconnectedCallback();
      this.context.stateHandler = null;
    }
  }

  protected destroyAnimationHandler(): void {
    if (this.context.animationHandler) {
      this.context.animationHandler = null;
    }
  }

  protected destroyEventHandler(): void {
    if (this.context.eventHandler) {
      this.context.eventHandler = null;
    }
  }

  public logDestroyedObjects() {
    console.log("Emptied base component instance: ", this.context.base);
    console.log("Emptied styles component instance: ", this.context.styles);
    console.log("Emptied stylesheet component instance: ", this.context.stylesheet);
    console.log("Emptied shadowDOM component instance: ", this.context.shadowDOM);
    console.log("Emptied eventHandlers component instance: ", this.context.eventHandlers);
    console.log("Emptied stateHandler instance: ", this.context.stateHandler);
    console.log("Emptied animationHandler instance: ", this.context.animationHandler);
    console.log("Emptied eventHandler instance: ", this.context.eventHandler);
    console.log("Destroyed object with ID: ", this.context.componentID);
  }
}
