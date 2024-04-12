import BaseComponent from "./BaseComponent";

export default class StateHandler extends BaseComponent {
  constructor(context: any) {
    super(context);
  }

  public refDataNodeList: NodeListOf<HTMLElement>;
  public _watch: Record<string, (newValue: any, oldValue: any) => void>;
  public watchers: { [key: string]: (newValue: any, oldValue: any) => void } = {};
  public _proxiedData: {};

  public watch(property: string, callback: (newValue: any, oldValue: any) => void): void {
    if (!this.watchers[property]) {
      this.watchers[property] = callback;
    }
  }

  public _proxyHandler: ProxyHandler<{}> = {
    get: (target: {}, key: string): any => {
      const value: any = target[key];

      if (typeof value === "object" && value !== null) {
        return new Proxy(target[key], this._proxyHandler);
      }

      return value;
    },
    set: (target: {}, key: string, newValue: any): boolean => {
      const oldValue: any = target[key];

      if (oldValue !== newValue) {
        if (typeof newValue === "object" && newValue !== null) {
          newValue = new Proxy<{}>(newValue, this._proxyHandler);
        }

        target[key] = newValue;
        this.observeComponentHTML();
        this.triggerWatchers(key, newValue, oldValue);
      }

      return true;
    }
  }

  public setInitialState(): void {
    this._proxiedData = new Proxy<{}>(this.context.data, this._proxyHandler);
    this.context.refProxy = this._proxiedData;
    this.observeComponentHTML();
    this.observeWatchers();
  }

  public triggerWatchers(key: string, newValue: any, oldValue: any): void {
    for (const [watchKey, callback] of Object.entries(this.watchers)) {
      if (watchKey.includes(".")) {
        let keys: string[] = watchKey.split(".");

        for (let i = 0; i < keys.length; ++i) {
          let propKey: string = keys[i];

          if (propKey === key) {
            callback(newValue, oldValue);
          }
        }
      } else {
        if (this.watchers[key]) {
          this.watchers[key](newValue, oldValue);
        }
      }
    }
  }

  public observeWatchers(): void {
    this._watch = this.context.watch;

    if (this._watch) {
      for (const [key, value] of Object.entries(this._watch)) {
        this.watch(key, value);
      }
    }
  }

  public observeComponentHTML(): void {
    const observeDOM = (nodeList: NodeListOf<HTMLElement>) => {
      nodeList = this.context.$root.querySelectorAll("[ref-data]");

      const updateDOM = (refDataNode: HTMLElement, nestedValue: any): void => {
        try {
          if (refDataNode instanceof HTMLInputElement) {
            refDataNode.value = nestedValue.toString();
          } else {
            if (refDataNode.hasAttribute("innerHTML")) {
              refDataNode.innerHTML = nestedValue.toString();
            } else {
              refDataNode.textContent = nestedValue.toString();
            }
          }
        } catch (err: any) {
          if (this.context.devMode) {
            console.log(err);
          }
        }
      }

      if (nodeList.length >= 1) {
        for (let i = 0; i < nodeList.length; ++i) {
          let refDataNode: HTMLElement = nodeList[i];
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
          updateDOM(refDataNode, nestedValue);
        }
      }
    }
    observeDOM(this.refDataNodeList);
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

  protected updateRefs(): void {
    if (this.context.shadowDOM) {
      this.context.shadowDOM.observeRefs();
    }
  }

  protected updateState(): void {
    if (this.context.stateHandler) {
      this.context.stateHandler.setInitialState();
    }
  }

  protected updateEvents(): void {
    if (this.context.events) {
      this.context.events();
    }
  }

  public cleanUpEvents(): void {
    if (this.context.events) {
      this.context.cleanUp();
    }
  }

  public disconnectedCallback(): void {
    this._proxiedData = null;
    this.refDataNodeList = null;
    this.watchers = null;
  }
}
