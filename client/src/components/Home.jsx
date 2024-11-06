import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="jumbotron">
      <h1 className="display-4">Welcome to AugurToken</h1>
      <p className="lead">Participate in contests and win rewards!</p>
      <hr className="my-4" />
      <p>Create a new contest or join an existing one to get started.</p>
      <Link to="/create-contest" className="btn btn-primary btn-lg mr-2" role="button">Create Contest</Link>
      <Link to="/contests" className="btn btn-secondary btn-lg" role="button">View Contests</Link>
    </div>
  );
}

export default Home;