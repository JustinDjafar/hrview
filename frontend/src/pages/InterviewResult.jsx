import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { FileText, SquarePlay, Loader, AlertCircle, X } from 'lucide-react';

export default function InterviewResult() {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedAnswers, setGroupedAnswers] = useState({});
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState({}); // State to track transcription status per answer

  const fetchAnswers = async () => {
    try {
              const response = await api.get('/video/answers/all');      setAnswers(response.data);
      
      // Group answers by user
      const grouped = response.data.reduce((acc, answer) => {
        const userId = answer.user.id;
        if (!acc[userId]) {
          acc[userId] = {
            user: answer.user,
            answers: []
          };
        }
        acc[userId].answers.push(answer);
        return acc;
      }, {});
      setGroupedAnswers(grouped);

    } catch (err) {
      setError('Failed to fetch candidate answers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, []);

  const handleTranscript = async (answerId) => {
    setIsTranscribing(prev => ({ ...prev, [answerId]: true }));
    try {
      await api.post(`/transcript/transcribe/${answerId}`);
      // Re-fetch all answers to get the updated transcript
      await fetchAnswers(); 
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

  const handleDelete = async (answerId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await api.delete(`/video/answers/${answerId}`);
        alert('Video deleted successfully!');
        fetchAnswers();
      } catch (err) {
        alert('Failed to delete video. Please try again.');
        console.error('Delete error:', err);
      }
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
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Interview Result</h1>
      
      <div className="space-y-8">
        {Object.values(groupedAnswers).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 text-lg">No candidates found with video answers.</p>
            <p className="text-500 text-sm mt-2">Ensure users have submitted interviews.</p>
          </div>
        ) : (
          Object.values(groupedAnswers).map(({ user, answers }) => (
            <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              
              <div className="space-y-4">
                {answers.map(answer => (
                  <div key={answer.answer_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-800">{answer.question.title}</p>
                      <a 
                        href={`http://localhost:8000/${answer.video_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <SquarePlay size={14} />
                        Watch Video
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
                      <button
                        onClick={() => handleDelete(answer.answer_id)}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
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