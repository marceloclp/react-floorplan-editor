import { Middleware } from "@reduxjs/toolkit"
import RootState from "../types/RootState"
import { MiddlewareAPI } from "@reduxjs/toolkit"
import { Dispatch } from "@reduxjs/toolkit"
import { AnyAction } from "@reduxjs/toolkit"
import { historyPush } from "../features/History"

const HistoryMiddleware: Middleware =
  (store: MiddlewareAPI<Dispatch, RootState>) =>
  (next: Dispatch<AnyAction>) =>
  (action) => {
    const result = next(action);

    if (action.meta?.snapshotable) {
      store.dispatch(historyPush());
      console.log(store.getState());
    }

    return result;
  };

export default HistoryMiddleware;
