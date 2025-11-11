import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

export default function VideoInterviewUser() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [assignedList, setAssignedList] = useState(null);
  const [listQuestions, setListQuestions] = useState([]);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchAndCheck = async () => {
      if (loading || !user) {
        // Wait until user is loaded
        return;
      }

      setPageLoading(true);

      try {
        if (user.interview_status === 'completed') {
          setInterviewCompleted(true);
          setAssignedList(null); // No need to show list if completed
        } else if (user.assigned_list_id) {
          const listResponse = await api.get(`/list/lists-all`);
          const foundList = listResponse.data.find(list => list.id_list_question === user.assigned_list_id);

          if (foundList) {
            setAssignedList(foundList);
            setListQuestions(foundList.questions);

            const answersResponse = await api.get(`/video/answers/${user.id_user}/${foundList.id_list_question}`);
            const fetchedAnswers = answersResponse.data;
            setSubmittedAnswers(fetchedAnswers);

            if (fetchedAnswers.length > 0 && fetchedAnswers.length === foundList.questions.length) {
              setInterviewCompleted(true);
              if (user.interview_status !== 'completed') {
                await api.post('/users/me/complete-interview');
              }
            } else {
              setInterviewCompleted(false);
            }
          } else {
            // Assigned list not found, treat as no interview assigned
            setAssignedList(null);
            setInterviewCompleted(false);
          }
        } else {
          // No list assigned
          setAssignedList(null);
          setInterviewCompleted(false);
        }
      } catch (error) {
        console.error('Failed to fetch interview data:', error);
        // Fallback to user status on error
        setInterviewCompleted(user.interview_status === 'completed');
      } finally {
        setPageLoading(false);
      }
    };

    fetchAndCheck();
  }, [user, loading]);

  if (pageLoading) {
    return <div>Loading page...</div>;
  }

  return (
    <div className="h-full w-full p-8 left-10" style={{ backgroundColor: '#FFFDF6' }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Video Interview</h2>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="space-y-6">
            {assignedList ? (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{assignedList.list_title}</h3>
                <p className="text-sm text-gray-600">Durasi: {assignedList.minutes} menit</p>
                <p className="text-sm text-gray-600">Jumlah Pertanyaan: {listQuestions.length}</p>
                <div className="space-y-3 mt-4">
                  {listQuestions.map((question, index) => {
                    const isSubmitted = submittedAnswers.some(answer => answer.question_id === question.id_question);
                    return (
                      <div key={question.id_question} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div>
                          <h4 className="font-medium text-gray-800">{`Pertanyaan ${index + 1}: ${question.question_title}`}</h4>
                          {isSubmitted ? (
                            <p className="text-sm text-green-600">Submitted</p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {interviewCompleted ? (
                  <div className="mt-6 text-center">
                    <p className="text-lg font-semibold text-green-600">Interview completed, please wait for result</p>
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate('/instructions')}
                    className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Mulai Interview
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-800">Belum ada interview yang di-assign.</h3>
                <p className="text-gray-600">Silakan hubungi administrator Anda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}