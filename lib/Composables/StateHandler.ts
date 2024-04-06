import BaseComponent from "./BaseComponent";

export default class StateHandler extends BaseComponent {
  public constructor(context: any) {
    super(context);
  }

  protected refDataNodeList: NodeListOf<HTMLElement>;

  public _proxyHandler: ProxyHandler<{}> = {
    get: (target: {}, key: string | symbol) => {
      if (typeof target[key] === "object" && target[key] !== null) {
        return new Proxy(target[key], this._proxyHandler);
      } else {
        return target[key];
      }
    },
    set: (target: {}, key: string | symbol, newValue: any, receiver: any) => {
      if (typeof newValue === "object" && newValue !== null) {
        newValue = new Proxy<{}>(target[key], this._proxyHandler);
      }

      if (Array.isArray(newValue)) {
        newValue = new Proxy<[]>(target[key], this._proxyHandler);
      }

      target[key] = newValue;
      this.context.data = target;
      this.observeDataAttrs();
      return true;
    }
  }

  public _proxiedData: {};

  public setInitialState(): void {
    this.context.data = this.context._data;
    this._proxiedData = new Proxy<{}>(this.context._data, this._proxyHandler);
    this.context.refProxy = this._proxiedData;
    this.observeDataAttrs();
  }

  public observeDataAttrs(): void {
    this.refDataNodeList = this.context.$root.querySelectorAll("[ref-data]");

    if (this.refDataNodeList.length >= 1) {
      for (let i = 0; i < this.refDataNodeList.length; ++i) {
        let refDataNode: HTMLElement = this.refDataNodeList[i];
        let refDataAttrValue: string = refDataNode.getAttribute("ref-data");

        // Split the attribute value by dots to handle nested objects
        let nestedKeys: string[] = refDataAttrValue.split(".");
        let nestedValue: any = this._proxiedData;

        // Traverse through the nested keys to get the final nested value
        for (let j = 0; j < nestedKeys.length; j++) {
          const key = nestedKeys[j];
          if (nestedValue.hasOwnProperty(key)) {
            nestedValue = nestedValue[key];
          } else {
            nestedValue = undefined;
            break;
          }
        }

        // Update the HTML element with the final nested value
        if (refDataNode instanceof HTMLInputElement) {
          refDataNode.value = nestedValue.toString();
        } else {
          refDataNode.textContent = nestedValue.toString();
        }
      }
    }
  }

  public forceUpdate(): void {
    this.cleanUpEvents();

    let templateChildren = Array.from<HTMLCollection>(this.context.template.content.children);
    let rootChildren = Array.from<HTMLCollection>(this.context.$root.children);

    for (let i: number = 0; i < templateChildren.length; ++i) {
      let templateChild: HTMLCollection | HTMLElement = templateChildren[i];
      let rootChild: HTMLCollection | HTMLElement = rootChildren[i];

      rootChild["replaceWith"](templateChild);
    }

    this.updateRefs();
    this.updateState();
    this.updateEvents();
  }

  protected updateRefs() {
    if (this.context.shadowDOM) {
      this.context.shadowDOM.observeRefs();
    }
  }

  protected updateState() {
    if (this.context.stateHandler) {
      this.context.stateHandler.setInitialState();
    }
  }

  protected updateEvents() {
    if (this.context.events) {
      this.context.events();
    }
  }

  public cleanUpEvents() {
    if (this.context.events) {
      this.context.cleanUp();
    }
  }

  public disconnectedCallback(): void {
    this._proxiedData = null;
    this.refDataNodeList = null;
  }
}
