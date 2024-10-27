import './App.css'

const SomeOtherComponent = () => (
  <svg viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={30} fill="red"/>
    <circle cx={5} cy={50} r={30} fill="white"/>
  </svg>
);

function App() {
  return (
    <>
      <div id="app">
        <SomeOtherComponent />
        <p>hello</p>
      </div>
    </>
  )
}

export default App
