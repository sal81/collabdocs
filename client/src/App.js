import './App.css';
import TextEditor from './TextEditor';
import { v4 as uuidv4 } from 'uuid'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'

function App() {
  return  (
  <Router>
    <Switch>
      <Route path = "/" exact>
        <Redirect to = {`/documents/${uuidv4()}`}/>
      </Route>
      <Route path = "/documents/:id">
        
        <TextEditor/>
      </Route>
    </Switch>
  </Router>
  )
  
}

export default App;
