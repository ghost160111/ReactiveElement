import BaseComponent from "./BaseComponent";
import { REF_ATTRIBUTES_LIST, ATTRIBUTES_MAP } from "../Constants/AttributesMap";
import { ReactiveElement } from "../ReactiveElementLib";

export interface RefModelEvents {
  eventType: string;
  function: Function;
  target: HTMLElement;
}

export default class StateHandler<T_State extends object = any> extends BaseComponent<ReactiveElement> {
  public refDataNodeList: NodeListOf<HTMLElement>;
  public refModelNodeList: NodeListOf<HTMLElement>;
  public _watch: Record<string, (newValue: any, oldValue: any) => void>;
  public watchers: { [key: string]: (newValue: any, oldValue: any) => void };
  public _proxiedData: T_State;
  private attributesMap: Map<string, string>;
  public refModelEvents: Map<string, RefModelEvents>;
  public attrObserver: MutationObserver;

  protected _proxyHandler: ProxyHandler<T_State> = {
    get: (target: any, key: string): any => {
      const value: any = target[key];

      if (typeof value === "object" && value !== null) {
        return new Proxy<T_State>(target[key], this._proxyHandler);
      }

      return value;
    },
    set: (target: any, key: string, newValue: any): boolean => {
      const oldValue: any = target[key];

      if (oldValue !== newValue) {
        if (typeof newValue === "object" && newValue !== null) {
          newValue = new Proxy<T_State>(newValue, this._proxyHandler);
        }

        target[key] = newValue;
        this.observeComponentHTML();
        this.triggerWatchers(key, newValue, oldValue);
      }

      return true;
    }
  }

  constructor(context: ReactiveElement) {
    super(context);
    this.watchers = {};
    this.attributesMap = ATTRIBUTES_MAP;
    this.refModelEvents = new Map();
  }

  public setInitialState(): void {
    this._proxiedData = new Proxy<T_State>(this.context.data, this._proxyHandler);
    this.context.refProxy = this._proxiedData;
    this.observeComponentHTML();
    this.observeWatchers();

    this.attrObserver = new MutationObserver(() => {
      this.observeComponentHTML();
    });

    this.attrObserver.observe(this.context.$root, {
      attributes: true,
      attributeFilter: REF_ATTRIBUTES_LIST,
      subtree: true
    });
  }

  public watch(property: string, callback: (newValue: any, oldValue: any) => void): void {
    if (!this.watchers[property]) {
      this.watchers[property] = callback;
    }
  }

  protected triggerWatchers(key: string, newValue: any, oldValue: any): void {
    for (const [watchKey, callback] of Object.entries(this.watchers)) {
      if (watchKey.includes(".")) {
        let keys: string[] = watchKey.split(".");

        for (let i = 0; i < keys.length; ++i) {
          let propKey: string = keys[i];

          if (propKey === key) {
            callback(newValue, oldValue);
            break;
          }
        }
      } else {
        if (watchKey === key) {
          callback(newValue, oldValue);
          break;
        }
      }
    }
  }

  protected observeWatchers(): void {
    this._watch = this.context.watch;

    if (this._watch) {
      for (const [key, value] of Object.entries(this._watch)) {
        this.watch(key, value);
      }
    }
  }

  protected setNestedValue(refAttrValue: string, value: any): void {
    let nestedKeys: string[] = refAttrValue.split(".");
    let nestedValue: any = this._proxiedData;

    try {
      for (let j = 0; j < nestedKeys.length; ++j) {
        let key = nestedKeys[j];

        if (nestedValue.hasOwnProperty(key)) {
          nestedValue[key] = value;
        } else {
          nestedValue[key] = undefined;
          break;
        }
      }
    } catch (err) {
      if (this.context.devMode) {
        console.error(err);
      }
    }
  }

  protected getNestedValue(refAttrValue: string): any {
    let nestedKeys: string[] = refAttrValue.split(".");
    let nestedValue: any = this._proxiedData;

    try {
      for (let j = 0; j < nestedKeys.length; ++j) {
        let key = nestedKeys[j];

        if (nestedValue.hasOwnProperty(key)) {
          nestedValue = nestedValue[key];
        } else {
          nestedValue = undefined;
          break;
        }
      }
    } catch (err) {
      if (this.context.devMode) {
        console.error(err);
      }
    }

    return nestedValue;
  }

  protected updateRefModelNodes(nodeList: NodeListOf<HTMLElement>): void {
    if (nodeList.length >= 1) {
      for (let i = 0; i < nodeList.length; ++i) {
        const refModelNode: HTMLElement = nodeList[i];

        if (refModelNode instanceof HTMLInputElement || refModelNode instanceof HTMLTextAreaElement) {
          const refModelNodeAttrValue: string = refModelNode.getAttribute("ref-model");

          const refFunctionInput = (event: InputEvent): void => {
            let input: HTMLInputElement = event.target as HTMLInputElement;

            try {
              this.setNestedValue(refModelNodeAttrValue, input.value);
              // input.setAttribute("value", input.value);
              // nodeList.forEach((node: HTMLInputElement) => node.value = input.value);
            } catch (err) {
              if (this.context.devMode) {
                console.error(err);
              }
            }
          }

          const refFunctionChange = (event: Event): void => {
            let input: HTMLInputElement = event.target as HTMLInputElement;
            let value: any = null;

            if (input.type === "file") {
              value = input.files;
            } else {
              value = input.value;
            }

            try {
              this.setNestedValue(refModelNodeAttrValue, value);
            } catch (err) {
              if (this.context.devMode) {
                console.error(err);
              }
            }
          }

          const setInputTask = (): void => {
            this.refModelEvents.set(refModelNodeAttrValue, {
              eventType: "input",
              function: refFunctionInput,
              target: refModelNode
            });
            refModelNode.addEventListener("input", refFunctionInput);
          }

          const setChangeTask = (): void => {
            this.refModelEvents.set(refModelNodeAttrValue, {
              eventType: "change",
              function: refFunctionChange,
              target: refModelNode
            });
            refModelNode.addEventListener("change", refFunctionChange);
          }

          if (!this.refModelEvents.get(refModelNodeAttrValue)) {
            if (refModelNode instanceof HTMLInputElement) {
              switch (refModelNode.type) {
                case "text":
                case "phone":
                case "number":
                case "email":
                case "tel":
                  setInputTask();
                  break;
                case "file":
                  setChangeTask();
                  break;
              }
            } else if (refModelNode instanceof HTMLTextAreaElement) {
              setInputTask();
            }
          }
        }
      }
    }
  }

  protected updateRefDataNodes(nodeList: NodeListOf<HTMLElement>): void {
    if (nodeList.length >= 1) {
      for (let i = 0; i < nodeList.length; ++i) {
        let refDataNode: HTMLElement = nodeList[i];
        let refDataAttrValue: string = refDataNode.getAttribute("ref-data");
        let nestedValue: any = this.getNestedValue(refDataAttrValue);

        this.updateDOM(refDataNode, nestedValue);
      }
    }
  }

  protected updateDOM(refDataNode: HTMLElement, nestedValue: any): void {
    try {
      nestedValue = nestedValue.toString();

      if (refDataNode.hasAttribute("set-html")) {
        refDataNode.innerHTML = nestedValue;
      } else {
        refDataNode.textContent = nestedValue;
      }
    } catch (err: any) {
      if (this.context.devMode) {
        console.log(err);
      }
    }
  }

  protected updateAttrDOM(): void {
    try {
      const rootChildren: HTMLCollection = this.context.$root.children;

      const observeChildren = (children: HTMLCollection) => {
        if (children.length === 0) {
          return;
        }

        for (let i = 0; i < children.length; ++i) {
          const child: Element = children[i];
          const refAttrNameList: string[] = child.getAttributeNames();

          for (let j = 0; j < refAttrNameList.length; ++j) {
            const refAttrName: string = refAttrNameList[j];
            const isAttrMapHasAttr: boolean = this.attributesMap.has(refAttrName);
            const refAttrValue: string = child.getAttribute(refAttrName);

            if (this.context.devMode) {
              console.log(isAttrMapHasAttr, refAttrName, refAttrValue);
            }

            if (isAttrMapHasAttr) {
              let nestedValue = this.getNestedValue(refAttrValue);
              child.setAttribute(this.attributesMap.get(refAttrName), nestedValue);
            }
          }

          if (child.children.length > 0) {
            observeChildren(child.children);
          }
        }
      };

      if (rootChildren.length > 0) {
        observeChildren(rootChildren);
      }
    } catch (err) {
      if (this.context.devMode) {
        console.error(err);
      }
    }
  }

  public observeComponentHTML(): void {
    this.refDataNodeList = this.context.$root.querySelectorAll<HTMLElement>("[ref-data]");
    this.refModelNodeList = this.context.$root.querySelectorAll<HTMLElement>("[ref-model]");

    this.updateRefDataNodes(this.refDataNodeList);
    this.updateRefModelNodes(this.refModelNodeList);
    this.updateAttrDOM();
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
    this.attrObserver.disconnect();
  }
}
