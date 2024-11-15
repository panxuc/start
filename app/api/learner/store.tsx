import {
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import logger from "redux-logger";
import helper from "./helper"

const listenerMiddleware = createListenerMiddleware();


export const store = configureStore({
  reducer: {
    // data,
    helper,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .prepend(listenerMiddleware.middleware)
      .concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
