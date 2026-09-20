// App entry point: mounts the React component tree into the
// <div id="root"> element declared in index.html.
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
