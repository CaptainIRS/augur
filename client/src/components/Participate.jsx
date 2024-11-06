import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';

function Participate() {
  const { id } = useParams();
  const history = useHistory();

  const handleParticipate = async () => {
    try {
      await axios.post(`/api/participate/${id}`);
      alert('You have successfully joined the contest!');
      history.push(`/contest/${id}`);
    } catch (error) {
      console.error('Error participating in contest:', error);
      alert('Failed to join the contest. Please try again.');
    }
  };

  return (
    <div>
      <h2>Participate in Contest #{id}</h2>
      <p>Are you sure you want to participate in this contest?</p>
      <button onClick={handleParticipate} className="btn btn-primary">Confirm Participation</button>
    </div>
  );
}

export default Participate;