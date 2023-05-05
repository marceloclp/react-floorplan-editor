import Editor from './components/Editor/Editor'
import placeVerticesAtCenter from './utils/placeVerticesAtCenter'

const mod = 60;

function App() {
  return (
    <div className="w-screen h-screen">
      <Editor vertices={placeVerticesAtCenter([{x: 7, y: 2},
        {x: 7, y: 7},
        {x: 2, y: 2},
        {x: 1, y: 4}].map(({x,y}) => ({ x: x * mod, y: y * mod })), 20, 20)} />
    </div>
  )
}

export default App
