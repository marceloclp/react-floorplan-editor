import { Provider } from 'react-redux';
import Editor from './components/Editor/Editor';
import placeVerticesAtCenter from './utils/placeVerticesAtCenter';
import store from './store/store';

const mod = 60;

function App() {
  return (
    <div className="w-screen h-screen">
      <Provider store={store}>
        <Editor vertices={placeVerticesAtCenter([{x: 7, y: 2},
          {x: 7, y: 7},
          {x: 2, y: 2},
          {x: 1, y: 4}].map(({x,y}) => ({ x: x * mod, y: y * mod })), 20, 20)} />
      </Provider>
    </div>
  )
}

export default App
