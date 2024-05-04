import { DisconnectHandler, ShadowDOMHandler, StyleHandler } from "../ReactiveElementLib";

export default interface ICustomElement {
  disconnectHandler: DisconnectHandler;
  styles?: StyleHandler;
  shadowDOM?: ShadowDOMHandler;
  $root?: ShadowRoot;
  onConnected?(): void;
  onDisconnected?(): void;
  attributeChangedCallback?(name: string, oldValue: any, newValue: any): void;
  render(): string;
  cleanUp?(): void;
}
