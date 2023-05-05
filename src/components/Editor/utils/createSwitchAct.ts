import { AnyAction } from '@reduxjs/toolkit'
import { Dispatch } from 'react'

const createSwitchAct = (dispatch: Dispatch<AnyAction>) => {
  return <T extends string>(value: T, map: Partial<Record<T, () => AnyAction>>) => {
    for (const key in map) {
      if (key === value) {
        const action = map[key]?.();
        if (typeof action === 'object')
          return dispatch(action);
        return;
      }
    }
  }
};

export default createSwitchAct;
