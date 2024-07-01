import type { Meta, StoryObj } from "@storybook/vue3";
import AddIconButton from "../src/AddIconButton.vue";

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction

const meta = {
  title: "AddIconButton",
  component: AddIconButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  // tags: ["autodocs"],
} satisfies Meta<typeof AddIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddIconButtonStory: Story = {
  args: {
    className: "testing-storybook",
  },
};
