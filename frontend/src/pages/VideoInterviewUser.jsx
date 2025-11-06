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

  useEffect(() => {
    if (!loading && user && user.assigned_list_id) {
      const fetchAssignedList = async () => {
        try {
          const listResponse = await api.get(`/list/lists-all`);
          const foundList = listResponse.data.find(list => list.id_list_question === user.assigned_list_id);
          
          if (foundList) {
            setAssignedList(foundList);
            setListQuestions(foundList.questions);

            // Fetch submitted answers
            const answersResponse = await api.get(`/video/answers/${user.id_user}/${foundList.id_list_question}`);
            setSubmittedAnswers(answersResponse.data);
          }
        } catch (error) {
          console.error('Failed to fetch assigned list or answers:', error);
        }
      };
      fetchAssignedList();
    }
  }, [user, loading]);

  useEffect(() => {
    if (
      user &&
      listQuestions.length > 0 &&
      submittedAnswers.length === listQuestions.length
    ) {
      const completeInterview = async () => {
        try {
          await api.post('/users/me/complete-interview');
          console.log('Interview marked as completed.');
        } catch (error) {
          console.error('Failed to mark interview as completed:', error);
        }
      };
      completeInterview();
    }
  }, [submittedAnswers, listQuestions, user]);

  if (loading) {
    return <div>Loading user data...</div>;
  }

  const isInterviewCompleted = user?.interview_status === 'completed' || (submittedAnswers.length === listQuestions.length && listQuestions.length > 0);

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
                {isInterviewCompleted ? (
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
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Practice Sessions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Mock Interview</h4>
                  <p className="text-sm text-gray-600 mb-3">Practice with AI interviewer</p>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Start Practice
                  </button>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Question Bank</h4>
                  <p className="text-sm text-gray-600 mb-3">Common interview questions</p>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Browse Questions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}