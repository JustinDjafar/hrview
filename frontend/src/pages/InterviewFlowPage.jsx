import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QuestionDisplay from "../components/ui/Video-Interview/user/QuestionDisplay";
import RecordingSection from "../components/ui/Video-Interview/user/RecordingSection";
import FinishPage from "../components/ui/Video-Interview/user/FinishPage";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const InterviewFlowPage = () => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState("question"); // "question" || "recording" || "finish"
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return; // Wait for user auth to finish

        if (!user || !user.assigned_list_id) {
            setError("No interview assigned. Please contact administrator.");
            setIsLoading(false);
            return;
        }

        const fetchInterviewQuestions = async () => {
            try {
                const listResponse = await api.get("/list/lists-all");
                const assignedList = listResponse.data.find(
                    (list) => list.id_list_question === user.assigned_list_id
                );

                if (assignedList && assignedList.questions) {
                    const formattedQuestions = assignedList.questions.map(q => ({
                        id: q.id_question,
                        // Assuming the backend returns a relative path for the video
                        videoUrl: `http://localhost:8000/${q.url_video.replace(/\\/g, "/")}`,
                        prompt: q.question_title,
                    }));
                    setQuestions(formattedQuestions);
                } else {
                    setError("Could not find the assigned interview questions.");
                }
            } catch (err) {
                setError("Failed to fetch interview questions.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterviewQuestions();
    }, [user, authLoading]);

    const currentQuestion = questions[currentIndex];

    const handleStartRecording = () => {
        setPhase("recording");
    };

    const handleRecordingComplete = async (videoBlob) => {
        setIsUploading(true);
        
        const username = user?.name || "user";
        const questionText = currentQuestion.prompt.replace(/\s+/g, "_").toLowerCase().slice(0, 20);
        const dateStr = new Date().toISOString().split("T")[0];
        const filename = `${username}_${questionText}_${dateStr}.webm`;

        const formData = new FormData();
        formData.append("file", videoBlob, filename);
        formData.append("question_id", currentQuestion.id);
        
        try {
            await api.post("/video/answers/upload-video", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setPhase("question");
            } else {
                setPhase("finish");
            }
        } catch (error) {
            console.error("Upload failed:", error.response?.data || error.message);
            alert("Failed to upload video. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-red-500">
                    <p>{error}</p>
                    <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }
    
    if (questions.length === 0) {
         return (
            <div className="flex items-center justify-center min-h-screen">
                <p>No questions available for this interview.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto min-h-screen bg-white rounded-xl shadow-lg">
                {isUploading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-700">Uploading your video...</p>
                        </div>
                    </div>
                )}
                
                {phase === "question" && currentQuestion && (
                    <QuestionDisplay 
                        videoUrl={currentQuestion.videoUrl} 
                        prompt={currentQuestion.prompt}
                        onStartRecording={handleStartRecording}
                        questionNumber={currentIndex + 1}
                        totalQuestions={questions.length}
                    />
                )}

                {phase === "recording" && currentQuestion && (
                    <RecordingSection
                        questionId={currentQuestion.id}
                        onCompleteRecording={handleRecordingComplete}
                        question={currentQuestion.prompt}
                    />
                )}

                {phase === "finish" && <FinishPage />}
            </div>
        </div>
    );
};


export default InterviewFlowPage;