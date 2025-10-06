import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUser } from '../../store/authSlice';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../store/toastSlice';
import { getUserDiaries, createDiary, updateDiary, deleteDiary, toggleLike, addComment, deleteComment, updateUserProfile } from '../../lib/api';
import NavBar from '../shared/NavBar';

const ClientProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ message: '', status: 'public' });
  const [editingPost, setEditingPost] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});
  
  // Profile Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [editCooldown, setEditCooldown] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    fetchUserDiaries();
    checkEditCooldown();
  }, []);

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || ''
    });
  }, [user]);

  const checkEditCooldown = () => {
    const lastEdit = localStorage.getItem(`lastProfileEdit_${user?.id}`);
    if (lastEdit) {
      const lastEditDate = new Date(lastEdit);
      const now = new Date();
      const daysDiff = Math.floor((now - lastEditDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 3) {
        const daysRemaining = 3 - daysDiff;
        setEditCooldown(daysRemaining);
      }
    }
  };

  const fetchUserDiaries = async () => {
    try {
      setLoading(true);
      const response = await getUserDiaries(user.id);
      if (response.success) {
        setDiaries(response.data);
      }
    } catch (error) {
      console.error('Error fetching diaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.message.trim()) {
      dispatch(showWarningToast('⚠️ Please write something before posting!'));
      return;
    }

    try {
      const response = await createDiary(newPost);
      if (response.success) {
        setDiaries([response.data, ...diaries]);
        setNewPost({ message: '', status: 'public' });
        dispatch(showSuccessToast('📝 Post created successfully!'));
      }
    } catch (error) {
      console.error('Error creating diary:', error);
      dispatch(showErrorToast('❌ Failed to create post. Please try again.'));
    }
  };

  const handleUpdatePost = async (id) => {
    if (!editingPost.message.trim()) {
      dispatch(showWarningToast('⚠️ Post cannot be empty!'));
      return;
    }

    try {
      const response = await updateDiary(id, {
        message: editingPost.message,
        status: editingPost.status
      });
      if (response.success) {
        setDiaries(diaries.map(d => d.id === id ? response.data : d));
        setEditingPost(null);
        dispatch(showSuccessToast('✏️ Post updated successfully!'));
      }
    } catch (error) {
      console.error('Error updating diary:', error);
      dispatch(showErrorToast('❌ Failed to update post. Please try again.'));
    }
  };

  const handleDeletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDiary(id);
      setDiaries(diaries.filter(d => d.id !== id));
      dispatch(showSuccessToast('Post deleted successfully! 🗑️'));
    } catch (error) {
      console.error('Error deleting diary:', error);
      dispatch(showErrorToast('Failed to delete post. Please try again.'));
    }
  };

  const handleLike = async (diaryId) => {
    try {
      const response = await toggleLike(diaryId);
      if (response.success) {
        setDiaries(diaries.map(d => d.id === diaryId ? response.data : d));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (diaryId) => {
    const comment = commentTexts[diaryId]?.trim();
    if (!comment) {
      dispatch(showWarningToast('💬 Please write a comment first!'));
      return;
    }

    try {
      const response = await addComment(diaryId, comment);
      if (response.success) {
        setDiaries(diaries.map(d => {
          if (d.id === diaryId) {
            return {
              ...d,
              comments: [...(d.comments || []), response.data]
            };
          }
          return d;
        }));
        setCommentTexts({ ...commentTexts, [diaryId]: '' });
        dispatch(showSuccessToast('💬 Comment added!'));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      dispatch(showErrorToast('❌ Failed to add comment. Please try again.'));
    }
  };

  const handleDeleteComment = async (commentId, diaryId) => {
    try {
      await deleteComment(commentId);
      setDiaries(diaries.map(d => {
        if (d.id === diaryId) {
          return {
            ...d,
            comments: d.comments.filter(c => c.id !== commentId)
          };
        }
        return d;
      }));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      const response = await updateUserProfile(profileForm);
      if (response.success) {
        dispatch(updateUser(response.data));
        
        // Set cooldown
        localStorage.setItem(`lastProfileEdit_${user.id}`, new Date().toISOString());
        setEditCooldown(3);
        setShowEditModal(false);
        
        dispatch(showSuccessToast('🎉 Profile updated successfully! You can edit again in 3 days.', 6000));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.days_remaining) {
        dispatch(showWarningToast(`⏰ You can edit your profile in ${error.days_remaining} day${error.days_remaining !== 1 ? 's' : ''}`));
      } else {
        dispatch(showErrorToast('❌ Error updating profile. Please try again.'));
      }
    } finally {
      setUpdatingProfile(false);
    }
  };

  const canEditProfile = editCooldown === null || editCooldown <= 0;

  const stats = {
    totalPosts: diaries.length,
    publicPosts: diaries.filter(d => d.status === 'public').length,
    privatePosts: diaries.filter(d => d.status === 'private').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar activeTab="profile" />
      
      <main className="max-w-4xl mx-auto py-6 px-4">
        {/* Profile Header */}
        <div className="border border-gray-300 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-24 w-24 bg-black rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-black">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                {user?.bio && (
                  <p className="text-gray-700 mt-2 text-sm">{user?.bio}</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <button
                onClick={() => canEditProfile ? setShowEditModal(true) : null}
                disabled={!canEditProfile}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  canEditProfile 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Edit Profile
              </button>
              {!canEditProfile && (
                <p className="text-xs text-red-600 mt-1">
                  Can edit in {editCooldown} day{editCooldown !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-300">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{stats.totalPosts}</p>
              <p className="text-sm text-gray-600">Total Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{stats.publicPosts}</p>
              <p className="text-sm text-gray-600">Public</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{stats.privatePosts}</p>
              <p className="text-sm text-gray-600">Private</p>
            </div>
          </div>
        </div>

        {/* Create Post */}
        <div className="border border-gray-300 rounded-lg p-6 mb-8">
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPost.message}
              onChange={(e) => setNewPost({ ...newPost, message: e.target.value })}
              placeholder="What's on your mind?"
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-black"
              rows="3"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="public"
                    checked={newPost.status === 'public'}
                    onChange={(e) => setNewPost({ ...newPost, status: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Public</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="private"
                    checked={newPost.status === 'private'}
                    onChange={(e) => setNewPost({ ...newPost, status: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Private</span>
                </label>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Post
              </button>
            </div>
          </form>
        </div>

        {/* Posts Timeline */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : diaries.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No posts yet</div>
          ) : (
            diaries.map((diary) => (
              <div key={diary.id} className="border border-gray-300 rounded-lg p-6">
                {editingPost?.id === diary.id ? (
                  <div>
                    <textarea
                      value={editingPost.message}
                      onChange={(e) => setEditingPost({ ...editingPost, message: e.target.value })}
                      className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-black"
                      rows="3"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="public"
                            checked={editingPost.status === 'public'}
                            onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value })}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Public</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="private"
                            checked={editingPost.status === 'private'}
                            onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value })}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Private</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPost(null)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdatePost(diary.id)}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {diary.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-black">{diary.user?.name}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(diary.created_at).toLocaleDateString()} • 
                            <span className={`ml-1 ${diary.status === 'public' ? 'text-green-600' : 'text-gray-600'}`}>
                              {diary.status === 'public' ? '🌍 Public' : '🔒 Private'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPost({ id: diary.id, message: diary.message, status: diary.status })}
                          className="text-gray-600 hover:text-black"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(diary.id)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 whitespace-pre-wrap mb-4">{diary.message}</p>

                    {/* Like and Comment Buttons */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleLike(diary.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          diary.is_liked_by_user ? 'bg-black text-white' : 'hover:bg-gray-100'
                        }`}
                      >
                        <span>👍</span>
                        <span className="text-sm font-medium">{diary.likes_count || 0}</span>
                      </button>
                      <button
                        onClick={() => setShowComments({ ...showComments, [diary.id]: !showComments[diary.id] })}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span>💬</span>
                        <span className="text-sm font-medium">{diary.comments_count || 0}</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments[diary.id] && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {/* Add Comment */}
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={commentTexts[diary.id] || ''}
                            onChange={(e) => setCommentTexts({ ...commentTexts, [diary.id]: e.target.value })}
                            placeholder="Write a comment..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(diary.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(diary.id)}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                          >
                            Send
                          </button>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3">
                          {diary.comments?.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                              <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-white">
                                  {comment.user?.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-black">{comment.user?.name}</p>
                                <p className="text-sm text-gray-700">{comment.comment}</p>
                              </div>
                              {comment.user_id === user.id && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id, diary.id)}
                                  className="text-xs text-gray-600 hover:text-red-600"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">Bio (optional)</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows="3"
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                />
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    ⏰ Profile can only be updated once every 3 days
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingProfile ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;
