import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShoppingCart, Loader2, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaymentButtonProps {
  courseId: string;
  courseTitle: string;
  price: number;
  onPaymentComplete?: () => void;
}

const PaymentButton = ({ 
  courseId, 
  courseTitle, 
  price, 
  onPaymentComplete 
}: PaymentButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to purchase this course');
      navigate('/auth');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          amount: price,
          status: 'completed', // In real app, this would be 'pending' until Stripe confirms
          currency: 'USD',
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Create enrollment
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
        });

      if (enrollError) throw enrollError;

      toast.success('Payment successful! You are now enrolled.');
      setShowConfirmDialog(false);
      onPaymentComplete?.();
    } catch (error: any) {
      toast.error('Payment failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button 
        variant="hero" 
        className="w-full gap-2" 
        size="lg"
        onClick={() => {
          if (!user) {
            navigate('/auth');
            return;
          }
          setShowConfirmDialog(true);
        }}
      >
        <ShoppingCart className="w-5 h-5" />
        Buy Now - ${price}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="border-border">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase access to this course
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border border-border p-4 space-y-2">
              <h4 className="font-semibold">{courseTitle}</h4>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price</span>
                <span className="font-bold text-xl">${price}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Secure payment • Instant access after purchase</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              variant="hero" 
              className="flex-1 gap-2"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Confirm Payment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentButton;
