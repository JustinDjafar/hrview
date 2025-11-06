import react from  "react";
import { Edit2, Trash2 } from "lucide-react";

const UserCard = ({ user, questionLists, onEdit, onDelete, onAssignList }) => {
    const handleListAssign = (e) => {
        const listId = e.target.value === "" ? null : parseInt(e.target.value, 10);
        onAssignList(user.id_user, listId);
    };

    const assignedList = questionLists.find(list => list.id === user.assigned_list_id);

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
            <h3 className="text-gray-900 font-bold text-lg">{user.name}</h3>
            <p className="text-gray-600 text-sm">{user.email}</p>
            <p className="text-gray-600 text-sm">Role: {user.role}</p>
            </div>
            <div className="flex gap-2">
            <button
                onClick={() => onEdit(user)}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
            >
                <Edit2 className="text-blue-600" size={18} />
            </button>
            <button
                onClick={() => onDelete(user.id_user)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            >
                <Trash2 className="text-red-600" size={18} />
            </button>
            </div>
        </div>
        
        {user.role !== 'admin' && (
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign List Pertanyaan:
                </label>
                <select
                onChange={handleListAssign}
                value={user.assigned_list_id || ''}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                <option value="">-- Tidak Ada --</option>
                {questionLists.map(list => (
                    <option key={list.id} value={list.id}>
                    {list.name}
                    </option>
                ))}
                </select>
            </div>
        )}

        {assignedList && (
            <div className="mt-3">
            <p className="text-gray-700 text-sm font-semibold mb-2">List Terpilih:</p>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {assignedList.name} ({assignedList.videoIds.length} video, {assignedList.minutes} menit)
            </span>
            </div>
        )}
        </div>
    );
};
export default UserCard;