export default class ReactiveApp {
  protected template: HTMLTemplateElement;
  protected templateHTML: string;
  protected templateClone: Node;
  protected root: HTMLElement | Element;

  constructor(template: string, root: HTMLElement | Element | string) {
    this.template = document.createElement("template");
    this.templateHTML = template;
    this.template.innerHTML = this.templateHTML;
    this.templateClone = this.template.content.cloneNode(true);
    this.setRoot(root);
  }

  protected setRoot(root: HTMLElement | Element | string): void {
    if (root instanceof HTMLElement || root instanceof Element) {
      this.root = root;
    } else if (typeof root === "string") {
      this.root = document.querySelector(root);
    }
  }

  public render(): void {
    this.root.appendChild(this.templateClone);
  }
}
