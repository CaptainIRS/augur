import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ContestList() {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await axios.get('/api/contests');
        setContests(response.data);
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    };

    fetchContests();
  }, []);

  return (
    <div>
      <h2>Active Contests</h2>
      <div className="list-group">
        {contests.map((contest) => (
          <Link 
            key={contest.id} 
            to={`/contest/${contest.id}`} 
            className="list-group-item list-group-item-action"
          >
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">Contest #{contest.id}</h5>
              <small>Reward: {contest.totalReward} AUG</small>
            </div>
            <p className="mb-1">Rounds: {contest.currentRound}/{contest.totalRounds}</p>
            <small>Start Time: {new Date(contest.startTime * 1000).toLocaleString()}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ContestList;