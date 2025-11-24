import './App.css';
import { TaskIndex } from './components/TaskIndex';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🥐 Croissant Task Index (NeurIPS 2025)</h1>
      </header>
      <main>
        <TaskIndex />
      </main>
    </div>
  );
}

export default App;
