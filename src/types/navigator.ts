export interface NavigatorContext {
  goBack: () => boolean;
  goForward: () => boolean;
  goTo: (path: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  lastOperation: PageOperation;
}

export const enum PageOperation {
  Back,
  Forward,
  New,
}
