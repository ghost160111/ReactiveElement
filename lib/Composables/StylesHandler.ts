import BaseComponent from "./BaseComponent";

export default class StyleHandler extends BaseComponent {
  protected hostStylesheet: CSSStyleSheet;
  protected opacityInterval: any;
  protected opacityValue: number = 0;

  constructor(context: any) {
    super(context);
  }

  protected setupStylesheet(styles: string) {
    if (!styles) throw "Styles is empty, enter your styles in string value!";
    if (typeof styles !== "string") throw "Styles should be string type!";

    if (this.context.stylesheet && this.context.stylesheet instanceof CSSStyleSheet) {
      this.context.stylesheet.replaceSync(styles);
    }
  }

  public setupStylesheetCSS(css: string): void {
    this.setupStylesheet(css);
  }

  public setupStylesheetSASS(sass: string): void {
    let compiledSASS = this.getImportedSASS(sass);
    this.setupStylesheet(compiledSASS);
  }

  public getImportedSASS(importedSASS: any): string {
    return importedSASS[0][1];
  }

  public disconnectedCallback(): void {
    this.context.stylesheet = null;

    for (let i = 0; i < this.context.$root.adoptedStyleSheets.length; ++i) {
      let adoptedStyleSheet = this.context.$root.adoptedStyleSheets[i];
      if (adoptedStyleSheet === this.hostStylesheet) {
        adoptedStyleSheet = null;
      }
    }
  }
}
