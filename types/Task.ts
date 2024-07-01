export interface Task {
  id: string;
  uuid: string;
  startTime: string;
  endTime?: string;
  state: string;
  type: string;
  description: string;
  stoppable?: boolean;
  children?: Task[];
}
