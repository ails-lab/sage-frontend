import type { Preview } from "@storybook/vue3";

// import "../assets/styles/variables.scss";
// import "../assets/styles/mixin.scss";
// import "../assets/styles/default.scss";
// import "../assets/styles/default.scss";
import "~/assets/styles/main.scss";

const preview: Preview = {
  parameters: {
    // expanded: true,
    // hideNoControlsWarning: true,
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
