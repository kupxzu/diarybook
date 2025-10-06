import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../../store/authSlice';
import { 
  fetchPublicDiaries, 
  likeDiary, 
  commentOnDiary, 
  removeComment,
  createNewDiary,
  toggleLikeOptimistic,
  toggleComments,
  selectDiaries,
  selectDiariesLoading,
  selectLikingDiaryId,
  selectCommentingDiaryId,
  selectCreating,
  selectExpandedComments
} from '../../../store/diariesSlice';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../../store/toastSlice';
import NavBar from '../../shared/NavBar';

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const diaries = useSelector(selectDiaries);
  const loading = useSelector(selectDiariesLoading);
  const likingDiaryId = useSelector(selectLikingDiaryId);
  const commentingDiaryId = useSelector(selectCommentingDiaryId);
  const creating = useSelector(selectCreating);
  const expandedComments = useSelector(selectExpandedComments);
  
  const [commentTexts, setCommentTexts] = useState({});
  const [newPost, setNewPost] = useState({ message: '', status: 'public' });

  useEffect(() => {
    dispatch(fetchPublicDiaries());
  }, [dispatch]);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.message.trim()) {
      dispatch(showWarningToast('⚠️ Please write something before posting!'));
      return;
    }

    dispatch(createNewDiary(newPost))
      .unwrap()
      .then(() => {
        setNewPost({ message: '', status: 'public' });
        dispatch(showSuccessToast('📝 Post created successfully!'));
      })
      .catch((error) => {
        console.error('Error creating post:', error);
        dispatch(showErrorToast('❌ Failed to create post. Please try again.'));
      });
  };

  const handleLike = (diaryId) => {
    // Optimistic update for instant UI feedback
    dispatch(toggleLikeOptimistic(diaryId));
    // Then sync with server
    dispatch(likeDiary(diaryId))
      .unwrap()
      .then((result) => {
        console.log('Like synced with server:', result);
      })
      .catch((error) => {
        console.error('Like failed, reverted:', error);
      });
  };

  const handleToggleComments = (diaryId) => {
    dispatch(toggleComments(diaryId));
  };

  const handleAddComment = (diaryId) => {
    const comment = commentTexts[diaryId]?.trim();
    if (!comment) {
      dispatch(showWarningToast('💬 Please write a comment first!'));
      return;
    }

    dispatch(commentOnDiary({ diaryId, comment }))
      .unwrap()
      .then(() => {
        setCommentTexts({ ...commentTexts, [diaryId]: '' });
        dispatch(showSuccessToast('💬 Comment added!'));
      })
      .catch((error) => {
        console.error('Error adding comment:', error);
        dispatch(showErrorToast('❌ Failed to add comment. Please try again.'));
      });
  };

  const handleDeleteComment = (commentId, diaryId) => {
    if (confirm('Delete this comment?')) {
      dispatch(removeComment({ commentId, diaryId }))
        .unwrap()
        .then(() => {
          dispatch(showSuccessToast('🗑️ Comment deleted!'));
        })
        .catch((error) => {
          console.error('Error deleting comment:', error);
          dispatch(showErrorToast('❌ Failed to delete comment.'));
        });
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <NavBar activeTab="home" />
      <main className='max-w-4xl mx-auto py-6 px-4'>
        {/* Create Post Card */}
        <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6'>
          <form onSubmit={handleCreatePost}>
            <div className='flex items-start gap-3 mb-3'>
              <div className='h-10 w-10 bg-black rounded-full flex items-center justify-center flex-shrink-0'>
                <span className='text-sm font-bold text-white'>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <textarea
                value={newPost.message}
                onChange={(e) => setNewPost({ ...newPost, message: e.target.value })}
                placeholder={`What's on your mind, ${user?.name}?`}
                className='flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black'
                rows='3'
                disabled={creating}
              />
            </div>
            <div className='flex items-center justify-between'>
              <select
                value={newPost.status}
                onChange={(e) => setNewPost({ ...newPost, status: e.target.value })}
                className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black'
                disabled={creating}
              >
                <option value='public'>🌍 Public</option>
                <option value='private'>🔒 Private</option>
              </select>
              <button
                type='submit'
                disabled={creating || !newPost.message.trim()}
                className='px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2'
              >
                {creating ? (
                  <>
                    <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Public Diaries Feed */}
        <div className='space-y-6'>
          {loading ? (
            // Loading skeleton
            <div className='space-y-6'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='bg-white border border-gray-200 rounded-lg shadow-sm p-4 animate-pulse'>
                  <div className='flex items-start mb-4'>
                    <div className='h-10 w-10 bg-gray-200 rounded-full'></div>
                    <div className='ml-3 flex-1'>
                      <div className='h-4 bg-gray-200 rounded w-32 mb-2'></div>
                      <div className='h-3 bg-gray-200 rounded w-24'></div>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-full'></div>
                    
                  </div>
                  <div className='flex gap-4 mt-4 pt-4 border-t'>
                    <div className='h-8 bg-gray-200 rounded w-20'></div>
                    <div className='h-8 bg-gray-200 rounded w-24'></div>
                  </div>
                </div>
              ))}
            </div>
          ) : diaries.length === 0 ? (
            <div className='text-center py-8 text-gray-600'>No public posts yet</div>
          ) : (
            diaries.map((diary) => (
              <div key={diary.id} className='bg-white border border-gray-200 rounded-lg shadow-sm'>
                {/* Post Header */}
                <div className='flex items-start p-4 pb-3'>
                  <div className='h-10 w-10 bg-black rounded-full flex items-center justify-center'>
                    <span className='text-sm font-bold text-white'>
                      {diary.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className='ml-3 flex-1'>
                    <p className='font-semibold text-black text-sm'>{diary.user?.name}</p>
                    <p className='text-xs text-gray-500'>
                      {new Date(diary.created_at).toLocaleDateString()} · {new Date(diary.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                {/* Post Content */}
                <div className='px-4 pb-3'>
                  <p className='text-gray-900 whitespace-pre-wrap'>{diary.message}</p>
                </div>

                {/* Stats Bar */}
                <div className='flex items-center justify-between px-4 py-2 border-t border-gray-100 text-xs text-gray-500'>
                  <span>{diary.likes_count || 0} {diary.likes_count === 1 ? 'like' : 'likes'}</span>
                  <span>{diary.comments_count || 0} {diary.comments_count === 1 ? 'comment' : 'comments'}</span>
                </div>
                
                {/* Action Buttons */}
                <div className='flex items-center border-y border-gray-200'>
                  {/* Like Button - INSTAGRAM STYLE HEART */}
                  <button 
                    onClick={() => handleLike(diary.id)} 
                    className='flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-all'
                  >
                    {diary.is_liked_by_user ? (
                      // LIKED - RED SOLID HEART ❤️
                      <>
                        <svg 
                          className="w-6 h-6 animate-bounce-once" 
                          viewBox="0 0 24 24" 
                          fill="red"
                          stroke="red"
                          strokeWidth="1"
                        >
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        <span className='text-sm font-bold' style={{color: 'red'}}>Liked</span>
                      </>
                    ) : (
                      // NOT LIKED - GRAY OUTLINE HEART
                      <>
                        <svg 
                          className="w-6 h-6" 
                          viewBox="0 0 24 24" 
                          fill="none"
                          stroke="gray"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <span className='text-sm font-medium text-gray-600'>Like</span>
                      </>
                    )}
                  </button>
                  
                  {/* Comment Button */}
                  <button 
                    onClick={() => handleToggleComments(diary.id)} 
                    className='flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors'
                  >
                    <svg className="w-6 h-6" fill="none" stroke="gray" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className={`text-sm font-medium ${expandedComments[diary.id] ? 'text-black font-bold' : 'text-gray-600'}`}>Comment</span>
                  </button>
                </div>
                
                {/* Comments Section - Collapsible */}
                {expandedComments[diary.id] && (
                  <div className='p-4 bg-gray-50 border-t border-gray-200'>
                    {/* Add Comment */}
                    <div className='flex gap-2 mb-4'>
                      <div className='h-8 w-8 bg-black rounded-full flex items-center justify-center flex-shrink-0'>
                        <span className='text-xs font-bold text-white'>{user?.name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className='flex-1 flex gap-2'>
                        <input 
                          type='text' 
                          value={commentTexts[diary.id] || ''} 
                          onChange={(e) => setCommentTexts({ ...commentTexts, [diary.id]: e.target.value })} 
                          placeholder='Write a comment...' 
                          className='flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black text-sm' 
                          onKeyPress={(e) => { 
                            if (e.key === 'Enter' && !e.shiftKey) { 
                              e.preventDefault();
                              handleAddComment(diary.id); 
                            } 
                          }}
                          disabled={commentingDiaryId === diary.id}
                        />
                        <button 
                          onClick={() => handleAddComment(diary.id)} 
                          disabled={commentingDiaryId === diary.id || !commentTexts[diary.id]?.trim()}
                          className='px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                        >
                          {commentingDiaryId === diary.id ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Sending...</span>
                            </>
                          ) : (
                            'Send'
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Comments List */}
                    <div className='space-y-2'>
                      {diary.comments?.map((comment) => (
                        <div key={comment.id} className='flex items-start gap-2'>
                          <div className='h-8 w-8 bg-black rounded-full flex items-center justify-center flex-shrink-0'>
                            <span className='text-xs font-bold text-white'>{comment.user?.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className='flex-1'>
                            <div className='bg-white p-3 rounded-2xl'>
                              <p className='text-sm font-semibold text-black'>{comment.user?.name}</p>
                              <p className='text-sm text-gray-800'>{comment.comment}</p>
                            </div>
                            <div className='flex items-center gap-3 px-3 mt-1'>
                              <p className='text-xs text-gray-500'>{new Date(comment.created_at).toLocaleDateString()}</p>
                              {comment.user_id === user.id && (
                                <button onClick={() => handleDeleteComment(comment.id, diary.id)} className='text-xs text-gray-600 hover:text-red-600 font-medium'>Delete</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
