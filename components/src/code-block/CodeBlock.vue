<template>
  <div ref="codeMirrorContainerRef" style="width: 100%; height: 100%" />
</template>

<script setup lang="ts">
import { basicSetup } from "codemirror";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view";

const emit = defineEmits(["change", "scrolledToBottom"]);
const props = withDefaults(
  defineProps<{ isReadOnly?: boolean; documentText?: string }>(),
  { documentText: "" }
);

const codeMirrorContainerRef = ref<HTMLElement | null>(null);
const editorView = ref<EditorView>();

const editorViewTheme = EditorView.theme({
  "&": {
    height: "100%",
    overflow: "auto",
  },
});

watch(
  () => props.isReadOnly,
  (newValue) => {
    setReadOnly(newValue);
  }
);

watch(
  () => props.documentText,
  (newValue) => {
    setDocumentText(newValue);
  }
);

const readOnly = new Compartment();

const setReadOnly = (isReadonly: boolean) => {
  if (editorView.value) {
    editorView.value.dispatch({
      effects: readOnly.reconfigure(EditorState.readOnly.of(isReadonly)),
    });
  }
};

const viewUpdateHandler = debounce((viewUpdate: ViewUpdate) => {
  const { contentDOMHeight, editorHeight, scrollTop } =
    viewUpdate.view.viewState;
  const isBottomReached =
    contentDOMHeight - editorHeight - scrollTop < editorHeight;
  if (isBottomReached && scrollTop > 0) {
    emit("scrolledToBottom");
  }
  emit("change", viewUpdate.state.doc.toString());
}, 100);

const setDocumentText = (text = "") => {
  if (editorView.value) {
    editorView.value.dispatch({
      changes: { from: 0, to: editorView.value.state.doc.length, insert: text },
    });
  }
};

const initializeCodeEditor = () => {
  if (codeMirrorContainerRef.value) {
    editorView.value = new EditorView({
      doc: props.documentText,
      extensions: [
        basicSetup,
        editorViewTheme,
        readOnly.of(EditorState.readOnly.of(props.isReadOnly)),
        EditorView.updateListener.of(viewUpdateHandler),
      ],
      parent: codeMirrorContainerRef.value,
    });
  }
};

onMounted(() => {
  nextTick(() => {
    initializeCodeEditor();
  });
});
</script>
