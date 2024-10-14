import { DisconnectHandler, ReactiveElement, ShadowDOMHandler, StyleHandler } from "../ReactiveElementLib";

declare interface IAnimationOptions {
  setOpacityAnimation: boolean;
  duration?: number;
}

declare interface IComponentOptions {
  tag: string;
  component: CustomElementConstructor
}

declare interface ICustomElement {
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

declare interface IEventMapKey {
  eventType: keyof HTMLElementEventMap | keyof DocumentEventMap | keyof WindowEventMap | keyof ShadowRootEventMap;
  object: string | symbol | Window | Document | ShadowRoot | HTMLElement;
  parameters: any[]
}

declare interface IEventMapKeyList extends IEventMapKey {
  eventListenerName: string;
  eventObjectRefName: string;
}

declare interface Route {
  component: ReactiveElement;
  title?: string;
  callback?: () => void;
  routes?: Routes;
}

declare type Routes = Record<string, Route>;

declare interface ISetupConfig<T_Props extends any = any> {
  styles?: IStyleConfig;
  shadowDOM?: boolean;
  animations?: IAnimationOptions;
  devMode?: boolean;
  setFadeInTransition?: {
    value: boolean;
    duration?: number;
  },
  props?: T_Props,
  speechAPI?: boolean
}

declare interface IStyleConfig {
  adds?: {
    margins?: boolean;
  }
  css?: string;
  sass?: [string, string, string, { mappings: string, names: string[], sourceRoot: string, sources: string[], sourceContent: string[], version: number }];
  setOpacityAnimation?: boolean;
  links?: string[];
}

