import SockJS from "sockjs-client/dist/sockjs";
import { Client, over } from "stompjs";

type cbFunction = (message: object) => void;

const websocketUrl = useRuntimeConfig().public.wsUrl;

export default class SockJSService {
  private socket: WebSocket | null = null;
  private client: Client | null = null;
  private isConnected: Boolean = false;

  constructor(private readonly userId: string) {
    this.initializeSockJS();
  }

  private initializeSockJS() {
    this.socket = new SockJS(websocketUrl);
    this.client = over(this.socket);
    this.client.debug = () => {};
    this.isConnected = false;
  }

  subscribe(topics: string[], cbFunctions: cbFunction[]) {
    if (this.isConnected) {
      topics.forEach((topic, index) => {
        this.client?.subscribe(topic, cbFunctions[index], { id: topic });
      });
    } else {
      this.client?.connect({}, () => {
        this.isConnected = true;
        topics.forEach((topic, index) => {
          this.client?.subscribe(topic, cbFunctions[index], { id: topic });
        });
      });
    }
  }

  send(topic: string, message: any) {
    if (this.socket && this.socket.readyState === SockJS.OPEN) {
      this.socket.send(JSON.stringify({ topic, message }));
    }
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
