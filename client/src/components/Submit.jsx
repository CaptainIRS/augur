import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';

function Submit() {
  const { id, round } = useParams();
  const history = useHistory();
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a CSV file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`/api/submit/${id}/${round}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Submission successful!');
      history.push(`/contest/${id}`);
    } catch (error) {
      console.error('Error submitting entry:', error);
      alert('Failed to submit entry. Please try again.');
    }
  };

  return (
    <div>
      <h2>Submit Entry for Contest #{id}, Round {round}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="csvFile" className="form-label">Upload CSV File</label>
          <input type="file" className="form-control" id="csvFile" accept=".csv" onChange={handleFileChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Submit Entry</button>
      </form>
    </div>
  );
}

export default Submit;