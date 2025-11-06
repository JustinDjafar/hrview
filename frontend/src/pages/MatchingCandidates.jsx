import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Loader, AlertCircle, CheckCircle, FileText, X } from 'lucide-react';

export default function MatchingCandidates() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchingScores, setMatchingScores] = useState({});
  const [isCalculating, setIsCalculating] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch jobs
        const jobsResponse = await api.get('/jobs/');
        setJobs(jobsResponse.data);
        if (jobsResponse.data.length > 0) {
          setSelectedJobId(jobsResponse.data[0].id); // Select the first job by default
        }

        // Fetch candidates with answers
        const candidatesResponse = await api.get('/video/answers/all');
        // Group answers by user to get unique candidates
        const groupedCandidates = candidatesResponse.data.reduce((acc, answer) => {
          if (!acc[answer.user.id]) {
            acc[answer.user.id] = {
              id: answer.user.id,
              name: answer.user.name,
              email: answer.user.email,
              answers: []
            };
          }
          acc[answer.user.id].answers.push(answer);
          return acc;
        }, {});
        setCandidates(Object.values(groupedCandidates));

      } catch (err) {
        setError('Failed to fetch data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const combineTranscripts = (answers) => {
    return answers.map(answer => answer.transcript).filter(Boolean).join('\n\n---\n\n');
  };

  const handleViewTranscript = (candidateAnswers) => {
    const transcript = combineTranscripts(candidateAnswers);
    setSelectedTranscript(transcript || 'No transcripts available for this candidate.');
    setIsModalOpen(true);
  };

  const handleCalculateScore = async (userId) => {
    if (!selectedJobId) {
      alert('Please select a job first.');
      return;
    }
    setIsCalculating(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await api.get(`/matching/score/${selectedJobId}/${userId}`);
      setMatchingScores(prev => ({ ...prev, [userId]: response.data.score }));
    } catch (err) {
      alert('Failed to calculate score.');
      console.error(err);
      setMatchingScores(prev => ({ ...prev, [userId]: 'Error' }));
    } finally {
      setIsCalculating(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <p className="mt-4 text-lg text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Matching Candidates</h1>
      
      <div className="mb-6">
        <label htmlFor="job-select" className="block text-lg font-medium text-gray-700 mb-2">Select a Job:</label>
        <select
          id="job-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
        >
          {jobs.length === 0 ? (
            <option value="">No jobs available</option>
          ) : (
            jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))
          )}
        </select>
      </div>

      <div className="space-y-6">
        {candidates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 text-lg">No candidates found with video answers.</p>
            <p className="text-gray-500 text-sm mt-2">Ensure users have submitted interviews.</p>
          </div>
        ) : (
          candidates.map(candidate => (
            <div key={candidate.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{candidate.name}</h2>
                  <p className="text-sm text-gray-500">{candidate.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  {matchingScores[candidate.id] !== undefined && (
                    <span className="text-lg font-bold text-blue-600">
                      Score: {typeof matchingScores[candidate.id] === 'number' ? `${matchingScores[candidate.id].toFixed(2)}%` : matchingScores[candidate.id]}
                    </span>
                  )}
                  <button
                    onClick={() => handleViewTranscript(candidate.answers)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FileText size={20} />
                    View Transcript
                  </button>
                  <button
                    onClick={() => handleCalculateScore(candidate.id)}
                    disabled={isCalculating[candidate.id] || !selectedJobId}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCalculating[candidate.id] ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    {isCalculating[candidate.id] ? 'Calculating...' : 'Calculate Score'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Combined Transcript</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            <div className="prose max-w-none max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-md">
              <p>{selectedTranscript}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
