import FadeTransition from "./FadeTransition";
import ReactiveElement from "./ReactiveElement";
import TabMouseHandler from "./TabMouseHandler";

const SharedStateErrors = {
  setUniqueID: "You need to set unique ID for Dynamic CSS reference list!",
  specifyURL: "You need to specify URL of the dynamic CSS link!",
  sameIdInMapDetected: (id: string) => "Map with the same id " + id + " was found, enter different id for your map element!"
}

export default class SharedState {
  public components: Record<string, any>;
  public root: HTMLElement | null;
  public cssListURLMap: Map<string, string>;
  public fTransitionMap: Map<string, FadeTransition>;
  public tabMouseHandler: TabMouseHandler;

  constructor(rootElement?: HTMLElement | null) {
    this.components = {};
    this.cssListURLMap = new Map<string, string>();

    if (!rootElement) throw Error("Root element is null, check your callstack, or the element just doesn't exist!");
    this.root = rootElement;

    this.setTabMouseHandler();
  }

  /**
   * @description
   * Most of the time, you won't need this method, because it is called automatically right in the base class (ReactiveElement)
   */
  public setComponent<T>(context: T, name: string): void {
    if (this.components[name]) {
      let existingComponent: T | T[] = this.components[name];

      if (Array.isArray(existingComponent)) {
        existingComponent.push(context);
      } else if (existingComponent instanceof ReactiveElement) {
        Object.defineProperty(this.components, name, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: [
            existingComponent,
            context
          ]
        });
      }
    } else {
      Object.defineProperty(this.components, name, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: context
      });
    }
  }

  public async getComponent<T>(name: any): Promise<T> {
    return await new Promise<T>((resolve: (value: T) => void, reject: (reason?: any) => void): void => {
      const checkComponent = (): void => {
        let componentOrList: T = this.components[name];

        if (componentOrList !== undefined) {
          if (componentOrList instanceof ReactiveElement) {
            resolve(componentOrList);
          }

          if (Array.isArray(componentOrList)) {
            resolve(componentOrList);
          }
        } else {
          setTimeout(checkComponent);
        }
      }
      checkComponent();
    });
  }

  public async getAllComponents(): Promise<Record<string, any>> {
    return await new Promise<Record<string, any>>((resolve: (value: Record<string, any>) => void, reject: (reason?: any) => void): void => {
      const getList = (): void => {
        resolve(this.components);
      }
      setTimeout(getList);
    });
  }

  public checkCSSProperties(id: string, url: string): void {
    if (!id) throw SharedStateErrors.setUniqueID;
    if (!url) throw SharedStateErrors.specifyURL;
  }

  public setCSSURL(id: string, url: string): SharedState {
    this.checkCSSProperties(id, url);
    this.cssListURLMap.set(id, url);

    return this;
  }

  public setLinkToRoot(context: ReactiveElement, styleID: string): void {
    let dynamicCSSURL: string = this.cssListURLMap.get(styleID);
    let root: ShadowRoot = context.$root;

    if (dynamicCSSURL) {
      let rootFirstChild: ChildNode = root.firstChild;
      let link: HTMLLinkElement = document.createElement("link");
      let hasChildNodes: boolean = root.hasChildNodes();

      link.rel = "stylesheet";
      link.href = dynamicCSSURL;

      if (hasChildNodes) {
        if (!context[styleID]) {
          root.insertBefore(link, rootFirstChild);
          context[styleID] = true;
        }
      }
    }
  }

  public setFadeTransitionInstance(id: string, instance: FadeTransition): void {
    if (this.fTransitionMap.get(id)) {
      console.warn(SharedStateErrors.sameIdInMapDetected(id));
      return;
    }

    this.fTransitionMap.set(id, instance);
  }

  public setTabMouseHandler(): void {
    this.tabMouseHandler = new TabMouseHandler(this);
    this.tabMouseHandler.observeTabMouse();

    window.addEventListener("beforeunload", () => {
      alert("Removed events: [TabMouseHandler] component related event listeners...");
      this.tabMouseHandler.onDisconnected();
    });
  }
}
