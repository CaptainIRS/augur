import React, { useState } from 'react';
import axios from 'axios';
import { createContest } from '../contractIntegration';

function CreateContest() {
  const [formData, setFormData] = useState({
    metadata: '',
    totalReward: '',
    rewardThreshold: '',
    startTime: '',
    roundDuration: '',
    totalRounds: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // try {
    //   await axios.post('/api/createContest', formData);
    //   alert('Contest created successfully!');
    // } catch (error) {
    //   console.error('Error creating contest:', error);
    //   alert('Failed to create contest. Please try again.');
    // }

    try {
      const txHash = await createContest(
        formData.metadata,
        formData.totalReward,
        formData.rewardThreshold,
        formData.startTime,
        formData.roundDuration,
        formData.totalRounds
      );
      alert(`Contest created successfully! Transaction hash: ${txHash}`);
      // Clear form or redirect
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('Failed to create contest. Please try again.');
    }
  };

  return (
    <div>
      <h2>Create New Contest</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="metadata" className="form-label">Metadata</label>
          <input type="text" className="form-control" id="metadata" name="metadata" value={formData.metadata} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="totalReward" className="form-label">Total Reward</label>
          <input type="number" className="form-control" id="totalReward" name="totalReward" value={formData.totalReward} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="rewardThreshold" className="form-label">Reward Threshold</label>
          <input type="number" className="form-control" id="rewardThreshold" name="rewardThreshold" value={formData.rewardThreshold} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="startTime" className="form-label">Start Time</label>
          <input type="datetime-local" className="form-control" id="startTime" name="startTime" value={formData.startTime} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="roundDuration" className="form-label">Round Duration (in days)</label>
          <input type="number" className="form-control" id="roundDuration" name="roundDuration" value={formData.roundDuration} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="totalRounds" className="form-label">Total Rounds</label>
          <input type="number" className="form-control" id="totalRounds" name="totalRounds" value={formData.totalRounds} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Create Contest</button>
      </form>
    </div>
  );
}

export default CreateContest;