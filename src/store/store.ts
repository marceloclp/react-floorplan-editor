/* eslint-disable import/order */
import { configureStore } from '@reduxjs/toolkit';
import { combineFeatures } from './utils/toolkit';
import RootState from './types/RootState';
import { EDITOR_MODES } from './constants';

// Base editor features:
import Panning from './features/Panning';
import Zooming from './features/Zooming';
import History from './features/History';

// Vertex manipulation features:
import VertexSelecting from './features/VertexSelecting';
import VertexPlacing from './features/VertexPlacing';
import VertexDragging from './features/VertexDragging';

// Wall manipulation features:
import WallSelecting from './features/WallSelecting';
import WallPlacing from './features/WallPlacing';
import WallSplitting from './features/WallSplitting';
import WallDragging from './features/WallDragging';

// Shared entity manipulation features:
import EntityDeletion from './features/EntityDeletion';
import HistoryMiddleware from './middlewares/HistoryMiddleware';

const initialState: RootState = {
  vertices: {
    Rh3umgle6Kg8uihIMQSKE: {
      x: 180,
      y: -140,
      id: 'Rh3umgle6Kg8uihIMQSKE',
    },
    hNQBQQvz8cjCmSG3_XgHT: {
      x: 180,
      y: 140,
      id: 'hNQBQQvz8cjCmSG3_XgHT',
    },
    '7VNb7Pe5GdsHuHyYOUouj': {
      x: -120,
      y: -140,
      id: '7VNb7Pe5GdsHuHyYOUouj',
    },
    gmmZatL0h1lHhxcP60Mog: {
      x: -180,
      y: -20,
      id: 'gmmZatL0h1lHhxcP60Mog',
    },
  },
  walls: {
    HzOBuGdWcS6fdQAlqBzE7: {
      v1: 'Rh3umgle6Kg8uihIMQSKE',
      v2: 'hNQBQQvz8cjCmSG3_XgHT',
      id: 'HzOBuGdWcS6fdQAlqBzE7',
    },
    bjRGDofey1jQeAMNegWkx: {
      v1: 'Rh3umgle6Kg8uihIMQSKE',
      v2: '7VNb7Pe5GdsHuHyYOUouj',
      id: 'bjRGDofey1jQeAMNegWkx',
    },
    XzaJSmkpQHWkk5k2oWJpI: {
      v1: 'hNQBQQvz8cjCmSG3_XgHT',
      v2: '7VNb7Pe5GdsHuHyYOUouj',
      id: 'XzaJSmkpQHWkk5k2oWJpI',
    },
    '2X1ldIIz09oeTw2RpO9vv': {
      v1: '7VNb7Pe5GdsHuHyYOUouj',
      v2: 'gmmZatL0h1lHhxcP60Mog',
      id: '2X1ldIIz09oeTw2RpO9vv',
    },
    lYvO7W6IEGaKmN75VXqQc: {
      v1: 'hNQBQQvz8cjCmSG3_XgHT',
      v2: 'gmmZatL0h1lHhxcP60Mog',
      id: 'lYvO7W6IEGaKmN75VXqQc',
    },
  },
  mode: EDITOR_MODES.NONE,
  panning: {
    maxPanX: 500,
    maxPanY: 500,
    panX: 0,
    panY: 0,
    isDragPanning: false,
    isTwoFingersPanning: false,
  },
  zooming: {
    maxZoom: 2,
    minZoom: 0.5,
    zoom: 1,
  },
  history: {
    history: [],
    currentIndex: -1,
    maxSize: 50,
    redoStack: [],
    undoStack: [],
  },
};

const store = configureStore({
  reducer: combineFeatures(initialState, [
    Panning,
    Zooming,
    History,
    VertexSelecting,
    VertexPlacing,
    VertexDragging,
    WallSelecting,
    WallPlacing,
    WallSplitting,
    WallDragging,
    EntityDeletion,
  ]),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(HistoryMiddleware),
});

export default store;
