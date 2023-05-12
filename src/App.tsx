import { Provider } from 'react-redux';
import Editor from './components/Editor/Editor';
import store from './store/store';

function App() {
  return (
    <div className="w-screen h-screen">
      <Provider store={store}>
        <Editor />
      </Provider>
    </div>
  );
}

export default App;
