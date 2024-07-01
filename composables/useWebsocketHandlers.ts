import type {
  WsAnnotatorMessage,
  WsDatasetMessage,
  WsValidationMessage,
  WsMappingMessage,
} from "~/types/wsMessage";

const DELAY = 2000;

const useWsMappingHandler = () => {
  const { mappingChannelHistory } = storeToRefs(useWebsocketStore());
  const { getLastMessagesFromChannel } = useWebsocketStore();
  const { mutateMapping } = useSidebarDataStore();

  const handler = throttleWithDelay(() => {
    const messages = getLastMessagesFromChannel(
      "mapping"
    ) as WsMappingMessage[];
    const mutations: { [key: string]: WsMappingMessage } = {};
    messages.forEach((message) => {
      if (message.executeState) {
        const existingExecuteMessageOrder =
          mutations[message.instanceId]?.executeState?.order || 0;
        if (
          mutations[message.instanceId] &&
          message.executeState.order > existingExecuteMessageOrder
        ) {
          mutations[message.instanceId] = {
            ...mutations[message.instanceId],
            ...message,
          } as WsMappingMessage;
        } else {
          mutations[message.instanceId] = message;
        }
      } else if (message.publishState) {
        const existingPublisheMessageOrder =
          mutations[message.instanceId]?.publishState?.order || 0;
        if (
          mutations[message.instanceId] &&
          message.publishState.order > existingPublisheMessageOrder
        ) {
          mutations[message.instanceId] = {
            ...mutations[message.instanceId],
            ...message,
          } as WsMappingMessage;
        } else {
          mutations[message.instanceId] = message;
        }
      }
    });

    Object.values(mutations).forEach((mutation) => {
      mutateMapping(mutation);
    });
  }, DELAY);

  watch(mappingChannelHistory.value, () => {
    handler();
  });
};

const useWsDatasetHandler = () => {
  const { datasetChannelHistory } = storeToRefs(useWebsocketStore());
  const { getLastMessagesFromChannel } = useWebsocketStore();
  const { mutateDataset } = useSidebarDataStore();

  const handler = throttleWithDelay(() => {
    const messages = getLastMessagesFromChannel(
      "dataset"
    ) as WsDatasetMessage[];
    const mutations: { [key: string]: WsDatasetMessage } = {};
    messages.forEach((message) => {
      const existingMessageOrder = mutations[message.id]?.order || 0;
      if (mutations[message.id] && message.order > existingMessageOrder) {
        mutations[message.id] = {
          ...mutations[message.id],
          ...message,
        } as WsDatasetMessage;
      } else {
        mutations[message.id] = message;
      }
    });

    Object.values(mutations).forEach((mutation) => {
      mutateDataset(mutation);
    });
  }, DELAY);

  watch(datasetChannelHistory.value, () => {
    handler();
  });
};

const useWsAnnotatorHandler = () => {
  const { annotatorChannelHistory } = storeToRefs(useWebsocketStore());
  const { getLastMessagesFromChannel } = useWebsocketStore();
  const { mutateAnnotatorState } = useAnnotatorsStore();

  const handler = throttleWithDelay(() => {
    const messages = getLastMessagesFromChannel(
      "annotator"
    ) as WsAnnotatorMessage[];
    const mutations: { [key: string]: WsAnnotatorMessage } = {};
    messages.forEach((message) => {
      if (message.executeState) {
        const existingExecuteMessageOrder =
          mutations[message.id]?.executeState?.order || 0;
        if (
          mutations[message.id] &&
          message.executeState.order > existingExecuteMessageOrder
        ) {
          mutations[message.id] = {
            ...mutations[message.id],
            ...message,
          } as WsAnnotatorMessage;
        } else {
          mutations[message.id] = message;
        }
      } else if (message.publishState) {
        const existingPublisheMessageOrder =
          mutations[message.id]?.publishState?.order || 0;
        if (
          mutations[message.id] &&
          message.publishState.order > existingPublisheMessageOrder
        ) {
          mutations[message.id] = {
            ...mutations[message.id],
            ...message,
          } as WsAnnotatorMessage;
        } else {
          mutations[message.id] = message;
        }
      }
    });

    Object.values(mutations).forEach((mutation) => {
      mutateAnnotatorState(mutation);
    });
  }, DELAY);

  watch(annotatorChannelHistory.value, () => {
    handler();
  });
};

const useWsFilterValidationHandler = () => {
  const { filterChannelHistory } = storeToRefs(useWebsocketStore());
  const { getLastMessagesFromChannel } = useWebsocketStore();
  const { mutateFilterValidationState } = useAnnotationsStore();

  const handler = throttleWithDelay(() => {
    const messages = getLastMessagesFromChannel(
      "filter"
    ) as WsValidationMessage[];

    const mutations: { [key: string]: WsValidationMessage } = {};
    messages.forEach((message) => {
      if (message.executeState) {
        const existingExecuteMessageOrder =
          mutations[message.id]?.executeState?.order || 0;
        if (
          mutations[message.id] &&
          message.executeState.order > existingExecuteMessageOrder
        ) {
          mutations[message.id] = {
            ...mutations[message.id],
            ...message,
          } as WsValidationMessage;
        } else {
          mutations[message.id] = message;
        }
      } else if (message.publishState) {
        const existingPublisheMessageOrder =
          mutations[message.id]?.publishState?.order || 0;
        if (
          mutations[message.id] &&
          message.publishState.order > existingPublisheMessageOrder
        ) {
          mutations[message.id] = {
            ...mutations[message.id],
            ...message,
          } as WsValidationMessage;
        } else {
          mutations[message.id] = message;
        }
      }
    });

    Object.values(mutations).forEach((mutation) => {
      mutateFilterValidationState(mutation);
    });
  }, DELAY);

  watch(filterChannelHistory.value, () => {
    handler();
  });
};

const useWsPagedValidationHandler = () => {
  const { pagedChannelHistory } = storeToRefs(useWebsocketStore());
  const { getLastMessagesFromChannel } = useWebsocketStore();
  const { mutatePagedValidationState } = useAnnotationsStore();

  const handler = throttleWithDelay(() => {
    const messages = getLastMessagesFromChannel(
      "paged"
    ) as WsValidationMessage[];

    const mutations: { [key: string]: WsValidationMessage } = {};
    messages.forEach((message) => {
      if (message.executeState) {
        const existingExecuteMessageOrder =
          mutations[message.id]?.executeState?.order || 0;
        if (
          mutations[message.id] &&
          message.executeState.order > existingExecuteMessageOrder
        ) {
          mutations[message.id] = {
            ...mutations[message.id],
            ...message,
          } as WsValidationMessage;
        } else {
          mutations[message.id] = message;
        }
      } else if (message.publishState) {
        const existingPublisheMessageOrder =
          mutations[message.id]?.publishState?.order || 0;
        if (
          mutations[message.id] &&
          message.publishState.order > existingPublisheMessageOrder
        ) {
          mutations[message.id] = {
            ...mutations[message.id],
            ...message,
          } as WsValidationMessage;
        } else {
          mutations[message.id] = message;
        }
      } else if (message.lifecycleState) {
        const existingLifecycleMessageOrder =
          mutations[message.id]?.lifecycleState?.order || 0;
        if (
          mutations[message.id] &&
          message.lifecycleState.order > existingLifecycleMessageOrder
        ) {
          mutations[message.id] = {
            ...mutations[message.id],
            ...message,
          } as WsValidationMessage;
        } else {
          mutations[message.id] = message;
        }
      }
    });

    Object.values(mutations).forEach((mutation) => {
      mutatePagedValidationState(mutation);
    });
  }, DELAY);

  watch(pagedChannelHistory.value, () => {
    handler();
  });
};

export const useWebsocketHandlers = () => {
  useWsDatasetHandler();
  useWsMappingHandler();
  useWsAnnotatorHandler();
  useWsFilterValidationHandler();
  useWsPagedValidationHandler();
};
