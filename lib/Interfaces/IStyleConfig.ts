export default interface IStyleConfig {
  adds?: {
    margins?: boolean;
  }
  css?: string;
  sass?: [string, string, string, { mappings: string, names: string[], sourceRoot: string, sources: string[], sourceContent: string[], version: number }];
  setOpacityAnimation?: boolean;
  links?: string[];
}
