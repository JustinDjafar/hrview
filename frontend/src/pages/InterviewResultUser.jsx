import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { FileText, SquarePlay, Loader, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; // Import useAuth

export default function InterviewResultUser() {
  const { user, loading: userLoading } = useAuth(); // Get user from useAuth
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState({}); // State to track transcription status per answer

  const fetchAnswers = async () => {
    if (!user || userLoading) return; // Don't fetch if user is not loaded

    try {
      const response = await api.get(`/video/answers/user/${user.id}`); // Fetch answers for the current user
      setAnswers(response.data);
    } catch (err) {
      setError('Failed to fetch your interview answers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [user, userLoading]); // Re-fetch when user or userLoading changes

  const handleTranscript = async (answerId) => {
    setIsTranscribing(prev => ({ ...prev, [answerId]: true }));
    try {
      await api.post(`/transcript/transcribe/${answerId}`);
      await fetchAnswers(); // Re-fetch to get updated transcript
    } catch (err) {
      alert('Failed to transcribe video. Please try again.');
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(prev => ({ ...prev, [answerId]: false }));
    }
  };

  const handleViewTranscript = (transcript) => {
    setSelectedTranscript(transcript);
    setIsModalOpen(true);
  };



  if (loading || userLoading) {
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
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Interview Results</h1>
      
      <div className="space-y-8">
        {answers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 text-lg">You have not submitted any interview answers yet.</p>
            <p className="text-gray-500 text-sm mt-2">Please complete your video interviews to see results here.</p>
          </div>
        ) : (
          answers.map(answer => (
            <div key={answer.answer_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{answer.question.title}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <a 
                      href={`http://localhost:8000/${answer.video_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <SquarePlay size={14} />
                      Watch Your Video
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    {answer.transcript ? (
                      <button
                        onClick={() => handleViewTranscript(answer.transcript)}
                        className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        View Transcript
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleTranscript(answer.answer_id)}
                        disabled={isTranscribing[answer.answer_id]}
                        className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        {isTranscribing[answer.answer_id] ? 'Transcribing...' : 'Transcript'}
                      </button>
                    )}

                  </div>
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
              <h3 className="text-xl font-bold">Transcript</h3>
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