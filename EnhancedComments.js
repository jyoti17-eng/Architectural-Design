import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EnhancedComments = ({ designId, onCommentUpdate }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [stats, setStats] = useState(null);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [designId, filter, sort]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/design/${designId}`, {
        params: { filter, sort }
      });
      setComments(response.data.comments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/comments/stats/${designId}`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch comment stats:', error);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post('/api/comments', {
        content: newComment,
        designId,
        parentCommentId: replyTo,
        priority,
        tags
      });

      setComments([response.data.comment, ...comments]);
      setNewComment('');
      setReplyTo(null);
      setTags([]);
      toast.success('Comment added successfully!');
      
      if (onCommentUpdate) {
        onCommentUpdate();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const addReaction = async (commentId, reactionType) => {
    try {
      await axios.post(`/api/comments/${commentId}/reactions`, {
        type: reactionType
      });
      
      // Update local state
      setComments(comments.map(comment => 
        comment._id === commentId 
          ? { ...comment, reactions: [...(comment.reactions || []), { user: { _id: 'current-user' }, type: reactionType }] }
          : comment
      ));
    } catch (error) {
      console.error('Failed to add reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const resolveComment = async (commentId) => {
    try {
      await axios.post(`/api/comments/${commentId}/resolve`);
      
      setComments(comments.map(comment => 
        comment._id === commentId 
          ? { ...comment, isResolved: true, resolvedBy: { _id: 'current-user' }, resolvedAt: new Date() }
          : comment
      ));
      
      toast.success('Comment resolved!');
    } catch (error) {
      console.error('Failed to resolve comment:', error);
      toast.error('Failed to resolve comment');
    }
  };

  const pinComment = async (commentId) => {
    try {
      await axios.post(`/api/comments/${commentId}/pin`);
      
      setComments(comments.map(comment => 
        comment._id === commentId 
          ? { ...comment, isPinned: true, pinnedBy: { _id: 'current-user' }, pinnedAt: new Date() }
          : comment
      ));
      
      toast.success('Comment pinned!');
    } catch (error) {
      console.error('Failed to pin comment:', error);
      toast.error('Failed to pin comment');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getReactionEmoji = (type) => {
    switch (type) {
      case 'like': return '👍';
      case 'love': return '❤️';
      case 'laugh': return '😂';
      case 'wow': return '😮';
      case 'sad': return '😢';
      case 'angry': return '😠';
      default: return '👍';
    }
  };

  const getReactionCount = (comment, type) => {
    return comment.reactions?.filter(r => r.type === type).length || 0;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ color: '#64748b', marginTop: '16px' }}>Loading comments...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Stats */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#374151' }}>
              {stats.stats.totalComments}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Total Comments</div>
          </div>
          <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
              {stats.stats.resolvedComments}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Resolved</div>
          </div>
          <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
              {stats.stats.pinnedComments}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Pinned</div>
          </div>
          <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
              {stats.stats.totalReactions}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Reactions</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '20px', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: 'white'
          }}
        >
          <option value="all">All Comments</option>
          <option value="unresolved">Unresolved</option>
          <option value="resolved">Resolved</option>
          <option value="pinned">Pinned</option>
        </select>
        
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: 'white'
          }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="reactions">Most Reactions</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
          />
          Show Resolved
        </label>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={addComment} style={{ 
        background: '#f8fafc', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '24px' 
      }}>
        <div style={{ marginBottom: '16px' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? "Reply to comment..." : "Add a comment..."}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              resize: 'vertical'
            }}
            required
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          marginBottom: '16px'
        }}>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white'
            }}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>

          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags.join(', ')}
            onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              minWidth: '200px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {replyTo && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel Reply
            </button>
          )}
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: '#667eea',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {replyTo ? 'Reply' : 'Add Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              style={{
                background: comment.isPinned ? '#fef3c7' : 'white',
                border: comment.isPinned ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                position: 'relative'
              }}
            >
              {/* Comment Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#667eea',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {comment.author.firstName[0]}{comment.author.lastName[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#374151' }}>
                      {comment.author.firstName} {comment.author.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(comment.createdAt).toLocaleString()}
                      {comment.isEdited && ' (edited)'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {comment.isPinned && (
                    <span style={{ 
                      background: '#f59e0b', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      📌 PINNED
                    </span>
                  )}
                  
                  <span style={{
                    background: getPriorityColor(comment.priority),
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {comment.priority}
                  </span>

                  {comment.isResolved && (
                    <span style={{ 
                      background: '#10b981', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      ✅ RESOLVED
                    </span>
                  )}
                </div>
              </div>

              {/* Comment Content */}
              <div style={{ marginBottom: '12px', color: '#374151', lineHeight: '1.5' }}>
                {comment.content}
              </div>

              {/* Tags */}
              {comment.tags && comment.tags.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  {comment.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#e2e8f0',
                        color: '#64748b',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        marginRight: '6px'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Reactions */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
                {['like', 'love', 'laugh', 'wow', 'sad', 'angry'].map((reactionType) => {
                  const count = getReactionCount(comment, reactionType);
                  if (count === 0) return null;
                  
                  return (
                    <button
                      key={reactionType}
                      onClick={() => addReaction(comment._id, reactionType)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <span>{getReactionEmoji(reactionType)}</span>
                      <span>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                borderTop: '1px solid #f3f4f6',
                paddingTop: '12px'
              }}>
                <button
                  onClick={() => setReplyTo(comment._id)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#64748b'
                  }}
                >
                  💬 Reply
                </button>

                <button
                  onClick={() => addReaction(comment._id, 'like')}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#64748b'
                  }}
                >
                  👍 Like
                </button>

                {!comment.isResolved && (
                  <button
                    onClick={() => resolveComment(comment._id)}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #10b981',
                      borderRadius: '4px',
                      background: '#f0fdf4',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#10b981'
                    }}
                  >
                    ✅ Resolve
                  </button>
                )}

                {!comment.isPinned && (
                  <button
                    onClick={() => pinComment(comment._id)}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #f59e0b',
                      borderRadius: '4px',
                      background: '#fef3c7',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#f59e0b'
                    }}
                  >
                    📌 Pin
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedComments;


