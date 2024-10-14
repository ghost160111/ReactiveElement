import { ReactiveElement } from "../ReactiveElementLib";
import BaseComponent from "./BaseComponent";

type StyleSheet = {
  css: string;
  sass: string;
}

export default class StyleHandler extends BaseComponent<ReactiveElement> {
  public hostStylesheet: CSSStyleSheet;
  public cssStylesheet: CSSStyleSheet;
  public sassStylesheet: CSSStyleSheet;

  protected hostBaseStyle: string = /*css*/`
    :host {
      display: block;
      transition: all 0.3s ease !important;
    }

    * {
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }
  `;

  constructor(context: ReactiveElement) {
    super(context);

    this.hostStylesheet = new CSSStyleSheet();
    this.hostStylesheet.replaceSync(this.hostBaseStyle);
  }

  protected setupStylesheet(styles: string, type?: keyof StyleSheet) {
    if (!styles) throw "Styles is empty, enter your styles in string value!";
    if (typeof styles !== "string") throw "Styles should be string type!";

    if (type === "css") {
      this.cssStylesheet = new CSSStyleSheet();
      this.cssStylesheet.replaceSync(styles);
    } else if (type === "sass") {
      this.sassStylesheet = new CSSStyleSheet();
      this.sassStylesheet.replaceSync(styles);
    }
  }

  public setupCSS(css: string): void {
    this.setupStylesheet(css, "css");
  }

  public setupSASS(sass: [string, string, string, { mappings: string; names: string[]; sourceRoot: string; sources: string[]; sourceContent: string[]; version: number; }]): void {
    let compiledSASS = this.getImportedSASS(sass);
    this.setupStylesheet(compiledSASS, "sass");
  }

  public getImportedSASS(importedSASS: any): string {
    return importedSASS[0][1];
  }

  public toggleClassList(element: HTMLElement, classListName: string, toggleValue: boolean): void {
    return (toggleValue)
      ? element.classList.add(classListName)
      : element.classList.remove(classListName);
  }

  /**
   * @deprecated
   * Don't even try to use this shit, because it almost kills the performance by adding endless lines of CSS code.
   */
  public setupMargins() {
    const finalStyles = /*css*/`
      :host {
        display: block;
        transition: all 0.3s ease !important;
      }
    `;

    this.hostStylesheet.replaceSync(finalStyles);
  }

  public disconnectedCallback(): void {
    this.hostStylesheet = null;
    this.cssStylesheet = null;
    this.sassStylesheet = null;

    for (let i = 0; i < this.context.$root.adoptedStyleSheets.length; ++i) {
      let adoptedStyleSheet = this.context.$root.adoptedStyleSheets[i];
      if (adoptedStyleSheet === this.hostStylesheet) {
        adoptedStyleSheet = null;
      }
    }
  }
}
