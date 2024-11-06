import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import CreateContest from './components/CreateContest';
import ContestList from './components/ContestList';
import ContestDetails from './components/ContestDetails';
import Participate from './components/Participate';
import Submit from './components/Submit';

import { useEffect } from 'react';
import { initializeContract } from './contractIntegration';


function App() {

  useEffect(() => {
    const init = async () => {
      try {
        await initializeContract();
      } catch (error) {
        console.error('Failed to initialize contract:', error);
        alert('Failed to connect to Ethereum network. Please make sure you have MetaMask installed and connected.');
      }
    };
    init();
  }, []);


  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container mt-4">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/create-contest" component={CreateContest} />
            <Route path="/contests" component={ContestList} />
            <Route path="/contest/:id" component={ContestDetails} />
            <Route path="/participate/:id" component={Participate} />
            <Route path="/submit/:id/:round" component={Submit} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;