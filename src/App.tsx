import { Provider } from 'react-redux';
import { store } from './store';
import { WorkspaceLayout } from './features/territory-manager/components';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <WorkspaceLayout />
    </Provider>
  );
}

export default App;
