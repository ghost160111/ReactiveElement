import IStyleConfig from "./IStyleConfig";
import IAnimationOptions from "./IAnimationOptions";

export default interface ISetupConfig<T_Props extends any = any> {
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
