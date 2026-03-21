import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { StaticRouter } from "react-router";

import { AppContainer } from "@web-speed-hackathon-2026/client/src/containers/AppContainer";
import { store } from "@web-speed-hackathon-2026/client/src/store";

export function render(url: string): string {
  return renderToString(
    <Provider store={store}>
      <StaticRouter location={url}>
        <AppContainer />
      </StaticRouter>
    </Provider>,
  );
}
