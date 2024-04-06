import BaseComponent from "./BaseComponent";

type ObjectOptions = PropertyDescriptor & ThisType<any>;

export default class ShadowDOMHandler extends BaseComponent {
  public refs: {} = {};
  protected refNodeList: NodeListOf<HTMLElement>;

  constructor(context: any) {
    super(context);
    this.observeRefs();
  }

  public observeRefs(): void {
    this.refNodeList = null;
    this.refNodeList = this.context.$root.querySelectorAll("[ref]");

    if (this.refNodeList.length > 0) {
      for (let i: number = 0; i < this.refNodeList.length; ++i) {
        let refNode = this.refNodeList[i];
        let refNodeAttrValue = refNode.getAttribute("ref");
        let tagNameNodeList = this.context.$root.querySelectorAll(`[ref=${refNodeAttrValue}]`);

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
    Object.defineProperty(this.refs, propName, options ?? {
      enumerable: true,
      configurable: true,
      writable: true,
      value: refNode
    });
  }

  public select(selector: string): HTMLElement | null {
    return this.context.$root.querySelector(selector);
  }

  public selectAll(selector: string): NodeListOf<HTMLElement> {
    return this.context.$root.querySelectorAll(selector);
  }

  public disconnectedCallback(): void {
    this.refs = null;
    this.refNodeList = null;
    this.context.refs = {};
  }
}
