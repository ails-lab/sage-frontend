import type {
  ExecuteState,
  LifeCycleState,
  PublishState,
  PublishStateString,
} from "./states";

interface IMessage {
  type: string;
  timestamp: string;
}

export class WebsocketMessage implements IMessage {
  type = "";
  timestamp = "";

  constructor(message: string) {
    const msg = JSON.parse(message);
    this.type = msg.type;
    this.timestamp = msg.issuedAt;
  }

  issuedAt(): string {
    return this.timestamp;
  }
}

export class WsLoginMessage extends WebsocketMessage {
  state: string;
  constructor(message: string) {
    super(message);
    const msg = JSON.parse(message);
    this.state = msg.state;
  }

  isNewLogin(): boolean {
    return this.type === "login" && this.state === "NEW_LOGIN";
  }
}

interface IMappingMessage extends IMessage {
  id: string;
  instanceId: string;
  publishState?: PublishState & { order: number };
  executeState?: ExecuteState & { order: number };
}
export class WsMappingMessage
  extends WebsocketMessage
  implements IMappingMessage
{
  id = "";
  instanceId = "";
  publishState?: PublishState & { order: number } = undefined;
  executeState?: ExecuteState & { order: number } = undefined;

  constructor(message: string) {
    super(message);
    const msg = JSON.parse(message);
    this.id = msg.id;
    this.type = "";
    this.instanceId = msg.instanceId;
    if (msg.type === "execute") {
      this.executeState = {
        order: msg.order,
        progress: msg.content.progress,
        state: msg.content.state,
        startedAt: msg.content.startedAt,
        completedAt: msg.content.completedAt,
      };
    }
    if (msg.type === "publish") {
      this.publishState = {
        order: msg.order,
        state: msg.content.state,
        startedAt: msg.content.startedAt,
        completedAt: msg.content.completedAt,
      };
    }
  }
}

interface IDatasetMessage extends IMessage {
  id: string;
  order: number;
  state: PublishStateString;
}

export class WsDatasetMessage
  extends WebsocketMessage
  implements IDatasetMessage
{
  id: string;
  order: number;
  state: PublishStateString;

  constructor(message: string) {
    super(message);
    const msg = JSON.parse(message);
    this.id = msg.id;
    this.order = msg.order;
    this.state = msg.content.state as PublishStateString;
  }
}

interface IAnnotatorMessage extends IMessage {
  id: string;
  publishState?: PublishState & { order: number };
  executeState?: ExecuteState & { order: number };
}
export class WsAnnotatorMessage
  extends WebsocketMessage
  implements IAnnotatorMessage
{
  id = "";
  publishState?: PublishState & { order: number } = undefined;
  executeState?: ExecuteState & { order: number } = undefined;

  constructor(message: string) {
    super(message);
    const msg = JSON.parse(message);
    this.id = msg.id;
    this.type = "";
    if (msg.type === "execute") {
      this.executeState = {
        order: msg.order,
        progress: msg.content.progress,
        state: msg.content.state,
        startedAt: msg.content.startedAt,
        completedAt: msg.content.completedAt,
      };
    }
    if (msg.type === "publish") {
      this.publishState = {
        order: msg.order,
        state: msg.content.state,
        startedAt: msg.content.startedAt,
        completedAt: msg.content.completedAt,
      };
    }
  }
}

interface IValidationMessage extends IMessage {
  id: string;
  aegId: string;
  publishState?: PublishState & { order: number };
  executeState?: ExecuteState & { order: number };
  lifecycleState?: LifeCycleState & { order: number };
}
export class WsValidationMessage
  extends WebsocketMessage
  implements IValidationMessage
{
  id = "";
  aegId = "";
  publishState?: PublishState & { order: number } = undefined;
  executeState?: ExecuteState & { order: number } = undefined;
  lifecycleState?: LifeCycleState & { order: number } = undefined;

  constructor(message: string) {
    super(message);
    const msg = JSON.parse(message);
    this.id = msg.id;
    this.aegId = msg.instanceId;
    this.type = "";
    if (msg.type === "execute") {
      this.executeState = {
        order: msg.order,
        progress: msg.content.progress,
        state: msg.content.state,
        startedAt: msg.content.startedAt,
        completedAt: msg.content.completedAt,
      };
    }
    if (msg.type === "publish") {
      this.publishState = {
        order: msg.order,
        state: msg.content.state,
        startedAt: msg.content.startedAt,
        completedAt: msg.content.completedAt,
      };
    }
    if (msg.type === "lifecycle") {
      this.lifecycleState = {
        order: msg.order,
        state: msg.content.state,
        startedAt: msg.content.startedAt,
        completedAt: msg.content.completedAt,
      };
    }
  }
}
