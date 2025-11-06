import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { Edit, Trash2 } from 'lucide-react';

const VideoManagementPage = ({ questionVideos, setQuestionVideos }) => {
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const handleEditClick = (video) => {
    setEditingVideoId(video.id);
    setNewTitle(video.title);
  };

  const handleSaveEdit = async (videoId) => {
    try {
      const formData = new FormData();
      formData.append('title', newTitle);

      await api.put(`/video/questions/${videoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setQuestionVideos(prev => prev.map(video =>
        video.id === videoId ? { ...video, title: newTitle } : video
      ));
      setEditingVideoId(null);
      setNewTitle('');
    } catch (error) {
      console.error('Failed to update video title:', error);
      alert('Failed to update video title.');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
    try {
      await api.delete(`/video/questions/${videoId}`);
      setQuestionVideos(prev => prev.filter(video => video.id !== videoId));
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Kelola Video HR</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questionVideos.length === 0 ? (
          <p className="text-gray-600 col-span-full">No HR videos uploaded yet.</p>
        ) : (
          questionVideos.map(video => (
            <div key={video.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-all">
              <a href={video.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-40 object-cover"
                />
              </a>
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    {editingVideoId === video.id ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <h3 className="text-gray-900 font-bold text-lg mb-1">{video.title}</h3>
                    )}
                    <p className="text-gray-600 text-sm">Video ID: {video.id}</p>
                  </div>
                  <div className="flex gap-2">
                    {editingVideoId === video.id ? (
                      <button
                        onClick={() => handleSaveEdit(video.id)}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick(video)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit size={18} className="text-blue-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VideoManagementPage;