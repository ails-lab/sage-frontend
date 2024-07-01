import SockJSService from "~/services/SockJSService";
import { useAuthStore } from "@/stores/auth";
import { Stack } from "@/types/stack";
import {
  WebsocketMessage,
  WsAnnotatorMessage,
  WsDatasetMessage,
  WsValidationMessage,
  WsLoginMessage,
  WsMappingMessage,
} from "@/types/wsMessage";

const { currentUser } = storeToRefs(useAuthStore());

type ChannelTopicType =
  | "annotator"
  | "dataset"
  | "distribution"
  | "embedder"
  | "file"
  | "filter"
  | "index"
  | "login"
  | "mapping"
  | "paged"
  | "task";

export const useWebsocketStore = defineStore("websocket", {
  state: () => ({
    websocket: null as SockJSService | null,
    channels: {
      annotator: new Stack<WsAnnotatorMessage>(),
      dataset: new Stack<WsDatasetMessage>(),
      distribution: new Stack<WebsocketMessage>(),
      embedder: new Stack<WebsocketMessage>(),
      file: new Stack<WebsocketMessage>(),
      filter: new Stack<WsValidationMessage>(),
      index: new Stack<WebsocketMessage>(),
      login: new Stack<WsLoginMessage>(),
      mapping: new Stack<WsMappingMessage>(),
      paged: new Stack<WsValidationMessage>(),
      task: new Stack<WebsocketMessage>(),
    },
  }),

  getters: {
    annotatorChannelHistory: (state) => state.channels.annotator.storage(),
    datasetChannelHistory: (state) => state.channels.dataset.storage(),
    distributionChannelHistory: (state) =>
      state.channels.distribution.storage(),
    embedderChannelHistory: (state) => state.channels.embedder.storage(),
    fileChannelHistory: (state) => state.channels.file.storage(),
    filterChannelHistory: (state) => state.channels.filter.storage(),
    indexChannelHistory: (state) => state.channels.index.storage(),
    loginChannelHistory: (state) => state.channels.login.storage(),
    mappingChannelHistory: (state) => state.channels.mapping.storage(),
    pagedChannelHistory: (state) => state.channels.paged.storage(),
    taskChannelHistory: (state) => state.channels.task.storage(),
  },

  actions: {
    initializeWebsocket() {
      if (!currentUser.value.id) {
        throw new Error("User is not authenticated");
      }
      // Define websocket topics
      const topics = [
        `/monitor/${currentUser.value.id}/annotator`,
        `/monitor/${currentUser.value.id}/dataset`,
        `/monitor/${currentUser.value.id}/distribution`,
        `/monitor/${currentUser.value.id}/embedder`,
        `/monitor/${currentUser.value.id}/file`,
        `/monitor/${currentUser.value.id}/filter_annotation_validation`,
        `/monitor/${currentUser.value.id}/index`,
        `/monitor/${currentUser.value.id}/login`,
        `/monitor/${currentUser.value.id}/mapping`,
        `/monitor/${currentUser.value.id}/paged_annotation_validation`,
        `/monitor/${currentUser.value.id}/user_task`,
      ];
      // Define websocket callback functions
      const callbackFunctions = [
        (m: any) =>
          this.channels.annotator.push(new WsAnnotatorMessage(m.body)),
        (m: any) => this.channels.dataset.push(new WsDatasetMessage(m.body)),
        (m: any) =>
          this.channels.distribution.push(new WebsocketMessage(m.body)),
        (m: any) => this.channels.embedder.push(new WebsocketMessage(m.body)),
        (m: any) => this.channels.file.push(new WebsocketMessage(m.body)),
        (m: any) => this.channels.filter.push(new WsValidationMessage(m.body)),
        (m: any) => this.channels.index.push(new WebsocketMessage(m.body)),
        (m: any) => this.channels.login.push(new WsLoginMessage(m.body)),
        (m: any) => this.channels.mapping.push(new WsMappingMessage(m.body)),
        (m: any) => this.channels.paged.push(new WsValidationMessage(m.body)),
        (m: any) => this.channels.task.push(new WebsocketMessage(m.body)),
      ];
      // Setup new websocket connection
      this.websocket = new SockJSService(currentUser.value.id);
      // Subscribe to all available channels
      this.websocket.subscribe(topics, callbackFunctions);
    },
    closeWebsocket() {
      this.websocket?.close();
    },

    readMessageFromChannel(topic: ChannelTopicType) {
      const peekedMessage = this.channels[topic].peek();
      return peekedMessage;
    },

    getLastMessagesFromChannel(topic: ChannelTopicType) {
      const messages = this.channels[topic].popAll();
      return messages;
    },
  },
});
