export type BrowsingItem = {
  icon: React.ReactNode;
  title: string;
};

export const enum PageAnimation {
  Forward,
  Back,
  New,
}

export interface IDetailHistory {
  prev: BrowsingItem[];
  current: BrowsingItem;
  next: BrowsingItem[];
  goBack: (n?: number, animation?: PageAnimation) => boolean;
  goForward: (n?: number, animation?: PageAnimation) => boolean;
  goTo: (path: string, animation?: PageAnimation) => void;
  setTitle: (title: string) => void;
  animation?: PageAnimation;
}
