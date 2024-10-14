import { ReactiveElement } from "../ReactiveElementLib";
import BaseComponent from "./BaseComponent";

export type ObjectOptions = PropertyDescriptor & ThisType<any>;

export default class ShadowDOMHandler extends BaseComponent<ReactiveElement> {
  public refs: Record<string, HTMLElement & NodeListOf<HTMLElement> & ReactiveElement>;
  protected refNodeList: NodeListOf<HTMLElement>;
  protected observer: MutationObserver;

  constructor(context: ReactiveElement) {
    super(context);
    this.refs = {};
    this.observeRefs();

    this.mutationCallback = this.mutationCallback.bind(this);
    this.observer = new MutationObserver(this.mutationCallback);

    try {
      this.observer.observe(this.context.$root, {
        childList: true,
        subtree: true,
        characterData: true
      });
    } catch (err) {
      console.error(err);
    }
  }

  protected mutationCallback(mutations: MutationRecord[]): void {
    this.observeRefs();
    if (this.context.devMode) {
      console.log(mutations);
    }
  }

  public observeRefs(): void {
    this.refNodeList = undefined;
    this.refNodeList = this.context.$root.querySelectorAll("[ref]");

    if (this.refNodeList.length > 0) {
      for (let i: number = 0; i < this.refNodeList.length; ++i) {
        let refNode = this.refNodeList[i];
        let refNodeAttrValue = refNode.getAttribute("ref");
        let tagNameNodeList: HTMLElement | NodeListOf<HTMLElement> = this.context.$root.querySelectorAll(`[ref=${refNodeAttrValue}]`);

        if (tagNameNodeList.length > 1) {
          this.defineRefProp(refNodeAttrValue, tagNameNodeList);
        } else {
          this.defineRefProp(refNodeAttrValue, refNode);
        }
      }
    }

    this.context.refs = this.refs;
  }

  protected defineRefProp(propName: string, refNode: HTMLElement | NodeListOf<HTMLElement>, options?: ObjectOptions): void {
    if (this.refs) {
      Object.defineProperty(this.refs, propName, options ?? {
        enumerable: true,
        configurable: true,
        writable: true,
        value: refNode
      });
    } else {
      setTimeout(() => {
        Object.defineProperty(this.refs, propName, options ?? {
          enumerable: true,
          configurable: true,
          writable: true,
          value: refNode
        });
      }, 100);
    }
  }

  public select(selector: string): HTMLElement | null {
    return this.context.$root.querySelector(selector);
  }

  public selectAll(selector: string): NodeListOf<HTMLElement> {
    return this.context.$root.querySelectorAll(selector);
  }

  /**
   * @description
   * Cleans the content inside of the node and sets template content or
   * another node or node listthat you entered as second parameter!
   *
   * @param {HTMLElement} targetNode This is target node where you want to set content to
   * @param {HTMLElement | NodeListOf<HTMLElement> | string} content Content object that want to set, it can be element, list of elements, or template html in string format!
   */
  public setContentToNode(targetNode: HTMLElement, content: HTMLElement | NodeListOf<HTMLElement> | string): void {
    targetNode.innerHTML = "";

    if (content instanceof HTMLElement) {
      targetNode.appendChild(content);
    } else if (content instanceof NodeList) {
      targetNode.append(...content);
    } else if (typeof content === "string") {
      targetNode.innerHTML = content;
    } else {
      throw "Content parameter value is set with wrong type, here is the list of types: HTMLElement | NodeListOf<HTMLElement> | string, pay attention please!";
    }
  }

  public disconnectedCallback(): void {
    this.refs = null;
    this.refNodeList = null;
    this.context.refs = {};

    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
