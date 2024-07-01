import type { Dataset } from "./Dataset";

export interface Campaign {
  id: string;
  name: string;
  state: string;
  type: string;
  datasets?: Dataset[];
  validators?: {}[];
}
