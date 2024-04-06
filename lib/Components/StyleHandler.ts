import BaseComponent from "./BaseComponent";

export default class StyleHandler extends BaseComponent {
  public hostStylesheet: CSSStyleSheet;
  public stylesheet: CSSStyleSheet;

  protected hostBaseStyle: string = /*css*/`
    :host {
      transition: all 0.3s ease !important;
    }
  `;

  constructor(context: any) {
    super(context);

    this.hostStylesheet = new CSSStyleSheet();
    this.stylesheet = new CSSStyleSheet();

    this.hostStylesheet.replaceSync(this.hostBaseStyle);
  }

  protected setupStylesheet(styles: string) {
    if (!styles) throw "Styles is empty, enter your styles in string value!";
    if (typeof styles !== "string") throw "Styles should be string type!";

    this.stylesheet.replaceSync(styles);
  }

  public setupCSS(css: string): void {
    this.setupStylesheet(css);
  }

  public setupSASS(sass: string): void {
    let compiledSASS = this.getImportedSASS(sass);
    this.setupStylesheet(compiledSASS);
  }

  public getImportedSASS(importedSASS: any): string {
    return importedSASS[0][1];
  }

  public disconnectedCallback(): void {
    this.hostStylesheet = null;
    this.stylesheet = null;

    for (let i = 0; i < this.context.$root.adoptedStyleSheets.length; ++i) {
      let adoptedStyleSheet = this.context.$root.adoptedStyleSheets[i];
      if (adoptedStyleSheet === this.hostStylesheet) {
        adoptedStyleSheet = null;
      }
    }
  }
}
