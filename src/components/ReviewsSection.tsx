import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewsSectionProps {
  courseId: string;
}

const ReviewsSection = ({ courseId }: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock reviews for demo
  const mockReviews: Review[] = [
    {
      id: '1',
      user_id: '1',
      rating: 5,
      title: 'Excellent course!',
      content: 'This course exceeded my expectations. The instructor explains complex concepts in a very understandable way. Highly recommended for beginners.',
      created_at: new Date().toISOString(),
      profile: {
        full_name: 'Sarah Johnson',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop'
      }
    },
    {
      id: '2',
      user_id: '2',
      rating: 4,
      title: 'Great content, could use more examples',
      content: 'The course material is comprehensive and well-structured. Would love to see more real-world project examples in future updates.',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      profile: {
        full_name: 'Michael Chen',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop'
      }
    },
    {
      id: '3',
      user_id: '3',
      rating: 5,
      title: 'Life-changing learning experience',
      content: 'After completing this course, I was able to land my dream job. The skills taught here are directly applicable to the industry.',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      profile: {
        full_name: 'Emily Williams',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop'
      }
    }
  ];

  useEffect(() => {
    setReviews(mockReviews);
  }, [courseId]);

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 || 0
  }));

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please sign in',
        description: 'You need to be signed in to leave a review.',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Add mock review
    const newReview: Review = {
      id: Date.now().toString(),
      user_id: user.id,
      rating: newRating,
      title: newTitle,
      content: newContent,
      created_at: new Date().toISOString(),
      profile: {
        full_name: user.email || 'Anonymous',
        avatar_url: null
      }
    };
    
    setReviews([newReview, ...reviews]);
    setNewTitle('');
    setNewContent('');
    setNewRating(5);
    setShowForm(false);
    setIsSubmitting(false);
    
    toast({
      title: 'Review submitted!',
      description: 'Thank you for your feedback.',
    });
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="text-center space-y-4">
          <div className="text-6xl font-display font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${star <= averageRating ? 'text-foreground fill-foreground' : 'text-muted'}`}
              />
            ))}
          </div>
          <p className="text-muted-foreground">{reviews.length} reviews</p>
        </div>

        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="w-8 text-sm text-muted-foreground">{rating} ★</span>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="w-8 text-sm text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review */}
      {user && !showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
          Write a Review
        </Button>
      )}

      {showForm && (
        <form onSubmit={handleSubmitReview} className="border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg">Write Your Review</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= newRating ? 'text-foreground fill-foreground' : 'text-muted'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-4 py-2 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Review</label>
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Share your thoughts about this course..."
              className="min-h-[100px] bg-background"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border border-border p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {review.profile?.avatar_url ? (
                  <img
                    src={review.profile.avatar_url}
                    alt=""
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-muted flex items-center justify-center text-lg font-bold">
                    {review.profile?.full_name?.[0] || 'A'}
                  </div>
                )}
                <div>
                  <p className="font-medium">{review.profile?.full_name || 'Anonymous'}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'text-foreground fill-foreground' : 'text-muted'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <Flag className="w-4 h-4" />
              </Button>
            </div>

            {review.title && (
              <h4 className="font-semibold">{review.title}</h4>
            )}
            
            {review.content && (
              <p className="text-muted-foreground">{review.content}</p>
            )}

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <ThumbsUp className="w-4 h-4" />
                Helpful
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
