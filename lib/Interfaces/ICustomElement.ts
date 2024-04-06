import { BaseHandler, ShadowDOMHandler, StyleHandler } from "../CustomElement";

export default interface ICustomElement {
  base: BaseHandler;
  styles?: StyleHandler;
  shadowDOM?: ShadowDOMHandler;
  $root?: ShadowRoot;
  onConnected?(): void;
  onDisconnected?(): void;
  attributeChangedCallback?(name: string, oldValue: any, newValue: any): void;
  render(): string;
  cleanUp?(): void;
}
