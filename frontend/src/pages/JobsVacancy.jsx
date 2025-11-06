import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const JobModal = ({ job, onSave, onClose }) => {
  const [title, setTitle] = useState(job ? job.title : '');
  const [description, setDescription] = useState(job ? job.description : '');
  const [requirements, setRequirements] = useState(job ? job.requirements : ['']);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(job ? `http://localhost:8000${job.image_url}` : '');

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setRequirements(newRequirements);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreviewUrl(job ? job.image_url : '');
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('requirements', JSON.stringify(requirements.filter(req => req.trim() !== '')));
    if (imageFile) {
      formData.append('file', imageFile);
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6">{job ? 'Edit Job' : 'Add New Job'}</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          <textarea
            placeholder="Job Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-lg h-32"
          />
          <div>
            <h3 className="font-semibold mb-2">Requirements</h3>
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Requirement"
                    value={req}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                  <button onClick={() => removeRequirement(index)} className="text-red-500">Remove</button>
                </div>
              ))}
            </div>
            <button onClick={addRequirement} className="mt-2 text-sm text-blue-500">+ Add Requirement</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded-lg"
            />
            {imagePreviewUrl && (
              <div className="mt-4">
                <img src={imagePreviewUrl} alt="Image Preview" className="max-h-40 object-contain" />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 border rounded-lg">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Save</button>
        </div>
      </div>
    </div>
  );
};

export default function JobsVacancy() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  console.log('User in JobsVacancy:', user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data);
    } catch (err) {
      setError('Failed to fetch jobs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSaveJob = async (jobData) => {
    try {
      if (editingJob) {
        // For editing, we are not handling image updates in this snippet.
        // The JobModal would need to be adjusted to handle this properly.
        const updatedJobData = {
          title: jobData.get('title'),
          description: jobData.get('description'),
          requirements: JSON.parse(jobData.get('requirements')),
          image_url: editingJob.image_url // Keep the old image url for now
        };
        await api.put(`/jobs/${editingJob.id}`, updatedJobData);
      } else {
        await api.post('/jobs/', jobData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      fetchJobs();
      setIsModalOpen(false);
      setEditingJob(null);
    } catch (err) {
      console.error('Failed to save job', err);
      alert('Failed to save job.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await api.delete(`/jobs/${jobId}`);
        fetchJobs();
      } catch (err) {
        console.error('Failed to delete job', err);
        alert('Failed to delete job.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Jobs Vacancy</h1>
        {user?.role === 'admin' && (
          <button onClick={() => { setEditingJob(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Add Job</button>
        )}
      </div>
      <div className="space-y-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-lg shadow-md flex gap-6">
            {job.image_url && (
              <img src={`http://localhost:8000${job.image_url}`} alt={job.title} className="w-48 h-48 object-cover rounded-lg" />
            )}
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
                {user?.role === 'admin' && (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingJob(job); setIsModalOpen(true); }} className="text-sm text-blue-500">Edit</button>
                    <button onClick={() => handleDeleteJob(job.id)} className="text-sm text-red-500">Delete</button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4">{job.description}</p>
              <div>
                <h3 className="font-semibold mb-2">Requirements:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <JobModal
          job={editingJob}
          onSave={handleSaveJob}
          onClose={() => {
            setIsModalOpen(false);
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
}
