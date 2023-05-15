import { Middleware , MiddlewareAPI , Dispatch , AnyAction } from '@reduxjs/toolkit';
import { historyPush } from '../features/History';
import RootState from '../types/RootState';

const HistoryMiddleware: Middleware =
  (store: MiddlewareAPI<Dispatch, RootState>) =>
  (next: Dispatch<AnyAction>) =>
  (action) => {
    const result = next(action);

    if (action.meta?.snapshotable) {
      store.dispatch(historyPush());
    }

    return result;
  };

export default HistoryMiddleware;
