import { useState } from 'react';
import { mockComments } from '@/data/mockData';
import { Comment } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageCircle, MoreHorizontal, Send } from 'lucide-react';

const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(false);

  return (
    <div className={`${isReply ? 'ml-12 mt-3' : ''}`}>
      <div className="flex gap-3">
        <img 
          src={comment.userAvatar} 
          alt={comment.userName}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.userName}</span>
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">{comment.content}</p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1 text-sm transition-colors ${
                liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-primary' : ''}`} />
              <span>{liked ? comment.likes + 1 : comment.likes}</span>
            </button>
            {!isReply && (
              <button 
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="flex gap-3 mt-3">
              <Textarea 
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <Button size="icon" variant="hero" className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      </div>
    </div>
  );
};

const CommentsSection = () => {
  const [newComment, setNewComment] = useState('');

  return (
    <div className="space-y-6">
      <h3 className="font-display font-semibold text-lg">
        Discussion ({mockComments.length} comments)
      </h3>

      {/* New Comment Input */}
      <div className="flex gap-3">
        <img 
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop"
          alt="Your avatar"
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 space-y-3">
          <Textarea 
            placeholder="Share your thoughts or ask a question..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button variant="hero" className="gap-2">
              <Send className="w-4 h-4" />
              Post Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6 pt-6 border-t border-border/50">
        {mockComments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
