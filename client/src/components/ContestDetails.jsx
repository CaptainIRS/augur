import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ContestDetails() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);

  useEffect(() => {
    const fetchContestDetails = async () => {
      try {
        const response = await axios.get(`/api/contest/${id}`);
        setContest(response.data);
      } catch (error) {
        console.error('Error fetching contest details:', error);
      }
    };

    fetchContestDetails();
  }, [id]);

  if (!contest) return <div>Loading...</div>;

  return (
    <div>
      <h2>Contest #{contest.id}</h2>
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Contest Details</h5>
          <p className="card-text">Total Reward: {contest.totalReward} AUG</p>
          <p className="card-text">Reward Threshold: {contest.rewardThreshold}</p>
          <p className="card-text">Start Time: {new Date(contest.startTime * 1000).toLocaleString()}</p>
          <p className="card-text">Round Duration: {contest.roundDuration} days</p>
          <p className="card-text">Current Round: {contest.currentRound}/{contest.totalRounds}</p>
        </div>
      </div>
      <h3>Rounds</h3>
      <div className="list-group">
        {[...Array(contest.totalRounds)].map((_, index) => (
          <div key={index} className="list-group-item">
            <h5 className="mb-1">Round {index + 1}</h5>
            <p className="mb-1">
              Status: {index + 1 < contest.currentRound ? 'Completed' : index + 1 === contest.currentRound ? 'Active' : 'Upcoming'}
            </p>
            {index + 1 === contest.currentRound && (
              <Link to={`/submit/${contest.id}/${index + 1}`} className="btn btn-primary btn-sm">Submit Entry</Link>
            )}
          </div>
        ))}
      </div>
      <Link to={`/participate/${contest.id}`} className="btn btn-success mt-3">Participate in Contest</Link>
    </div>
  );
}

export default ContestDetails;