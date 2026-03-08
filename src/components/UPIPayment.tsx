import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ShoppingCart, Loader2, Lock, CheckCircle, Download, 
  FileText, Clock, AlertCircle, Smartphone, IndianRupee,
  ChevronDown, ChevronUp
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import jsPDF from 'jspdf';

interface UPIPaymentProps {
  courseId: string;
  courseTitle: string;
  price: number;
  onPaymentComplete?: () => void;
}

type PaymentStatus = 'idle' | 'pending' | 'verifying' | 'completed' | 'failed';

const UPI_ID = 'tharaneetharanss-1@okicici';

const UPIPayment = ({ courseId, courseTitle, price, onPaymentComplete }: UPIPaymentProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentTimestamp, setPaymentTimestamp] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');

  // Generate UPI deep link
  const upiAmount = price;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=LearHub&am=${upiAmount}&cu=INR&tn=Course-${courseId.slice(0, 8)}`;

  const generateTransactionRef = () => {
    return `LWRT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const handleOpenPayment = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const ref = generateTransactionRef();
    setTransactionRef(ref);
    setPaymentStatus('pending');
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    if (!user) return;

    setPaymentStatus('verifying');

    try {
      // Create payment record as pending
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          amount: price,
          status: 'completed',
          currency: 'INR',
          stripe_payment_id: transactionRef,
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

      setPaymentId(payment.id);
      setPaymentTimestamp(new Date().toISOString());
      setPaymentStatus('completed');
      toast.success('Payment verified! Course access activated.');
      onPaymentComplete?.();
    } catch (error: any) {
      setPaymentStatus('failed');
      toast.error('Payment verification failed: ' + error.message);
    }
  };

  const generateInvoicePDF = () => {
    if (!paymentId || !paymentTimestamp) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(0, 255, 255);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('LEARN WITH RT', 20, 25);
    doc.setFontSize(10);
    doc.text('INVOICE', pageWidth - 40, 25);

    // Invoice details
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const startY = 55;
    doc.text(`Invoice No: ${transactionRef}`, 20, startY);
    doc.text(`Date: ${new Date(paymentTimestamp).toLocaleDateString('en-IN', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })}`, 20, startY + 8);
    doc.text(`Payment ID: ${paymentId.slice(0, 12)}...`, 20, startY + 16);
    doc.text(`UPI ID: ${UPI_ID}`, 20, startY + 24);

    // Student info
    doc.text(`Student: ${user?.email || 'N/A'}`, pageWidth / 2, startY);

    // Line separator
    doc.setDrawColor(0, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(20, startY + 32, pageWidth - 20, startY + 32);

    // Table header
    const tableY = startY + 42;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Description', 20, tableY);
    doc.text('Amount', pageWidth - 50, tableY);

    // Table content
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(courseTitle, 20, tableY + 10);
    doc.text(`₹${price.toFixed(2)}`, pageWidth - 50, tableY + 10);

    // Line separator
    doc.line(20, tableY + 16, pageWidth - 20, tableY + 16);

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Total Paid', 20, tableY + 26);
    doc.text(`₹${price.toFixed(2)}`, pageWidth - 50, tableY + 26);

    // Status badge
    doc.setFillColor(0, 200, 100);
    doc.roundedRect(20, tableY + 35, 50, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('PAYMENT COMPLETED', 24, tableY + 42);

    // Footer terms
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const footerY = 240;
    doc.text('Terms & Conditions:', 20, footerY);
    doc.text('1. This is a digital course purchase. No physical delivery applicable.', 20, footerY + 6);
    doc.text('2. Course access is non-transferable and linked to your registered account.', 20, footerY + 12);
    doc.text('3. Refund requests must be made within 7 days of purchase.', 20, footerY + 18);
    doc.text('4. Learn With RT reserves the right to modify course content.', 20, footerY + 24);
    doc.text(`Generated on ${new Date().toLocaleString('en-IN')} | UPI Payment`, 20, footerY + 34);

    doc.save(`Invoice_${transactionRef}.pdf`);
  };

  return (
    <>
      <Button 
        variant="hero" 
        className="w-full gap-2 font-mono-cyber tracking-wider" 
        size="lg"
        onClick={handleOpenPayment}
      >
        <IndianRupee className="w-5 h-5" />
        Pay ₹{price} via UPI
      </Button>

      <Dialog open={showPaymentDialog} onOpenChange={(open) => {
        if (paymentStatus !== 'verifying') setShowPaymentDialog(open);
      }}>
        <DialogContent className="max-w-lg border-primary/20 bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              UPI Payment
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Course Info */}
            <div className="neon-border p-4 space-y-2">
              <h4 className="font-semibold text-sm">{courseTitle}</h4>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Amount</span>
                <span className="font-display font-bold text-2xl text-primary">₹{price}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground font-mono-cyber">
                <span>Ref: {transactionRef}</span>
                <span>Currency: INR</span>
              </div>
            </div>

            {paymentStatus === 'completed' ? (
              /* Payment Success View */
              <div className="space-y-4">
                <div className="text-center space-y-3 py-4">
                  <div className="w-16 h-16 mx-auto bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-neon-green" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-neon-green">Payment Successful!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your course access has been activated.
                  </p>
                </div>

                {/* Invoice Summary */}
                <div className="neon-border p-4 space-y-3">
                  <h4 className="font-display text-sm tracking-wider uppercase text-primary">Invoice Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice No</span>
                      <span className="font-mono-cyber">{transactionRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-mono-cyber">{new Date(paymentTimestamp!).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="font-mono-cyber">UPI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UPI ID</span>
                      <span className="font-mono-cyber text-primary">{UPI_ID}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-bold">
                      <span>Total Paid</span>
                      <span className="text-primary">₹{price}</span>
                    </div>
                  </div>
                </div>

                {/* Download Invoice Button */}
                <Button 
                  onClick={generateInvoicePDF} 
                  className="w-full gap-2 font-mono-cyber tracking-wider"
                  variant="hero"
                >
                  <Download className="w-4 h-4" />
                  Download Invoice PDF
                </Button>

                <Button 
                  onClick={() => {
                    setShowPaymentDialog(false);
                    window.location.reload();
                  }} 
                  variant="outline" 
                  className="w-full gap-2 border-primary/30"
                >
                  Start Learning
                </Button>
              </div>
            ) : paymentStatus === 'failed' ? (
              /* Payment Failed View */
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto bg-destructive/10 border border-destructive/30 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="font-display font-bold text-lg text-destructive">Payment Failed</h3>
                <p className="text-sm text-muted-foreground">
                  Something went wrong. Please try again.
                </p>
                <Button 
                  onClick={() => setPaymentStatus('pending')} 
                  variant="hero" 
                  className="w-full font-mono-cyber"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              /* QR Code & Payment View */
              <>
                {/* QR Code */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white">
                    <QRCodeSVG 
                      value={upiLink}
                      size={200}
                      level="H"
                      includeMargin={false}
                      fgColor="#000000"
                      bgColor="#ffffff"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan with <span className="text-primary font-semibold">Google Pay</span>, 
                    <span className="text-primary font-semibold"> PhonePe</span>, or any UPI app
                  </p>
                </div>

                {/* UPI ID Display */}
                <div className="neon-border p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">UPI ID</p>
                    <p className="font-mono-cyber text-sm text-primary">{UPI_ID}</p>
                  </div>
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>

                {/* Open UPI App Button */}
                <a href={upiLink} className="block">
                  <Button 
                    variant="glass" 
                    className="w-full gap-2 font-mono-cyber tracking-wider"
                    size="lg"
                  >
                    <Smartphone className="w-5 h-5" />
                    Open UPI App to Pay
                  </Button>
                </a>

                {/* Confirm Payment Button */}
                <Button 
                  onClick={handleConfirmPayment}
                  disabled={paymentStatus === 'verifying'}
                  variant="hero"
                  className="w-full gap-2 font-mono-cyber tracking-wider"
                  size="lg"
                >
                  {paymentStatus === 'verifying' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      I Have Paid – Confirm Payment
                    </>
                  )}
                </Button>

                {/* Payment Status Indicator */}
                {paymentStatus === 'pending' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>Waiting for payment...</span>
                  </div>
                )}

                {/* Terms & Conditions */}
                <div className="border border-border bg-secondary/30">
                  <button 
                    onClick={() => setShowTerms(!showTerms)}
                    className="w-full p-3 flex items-center justify-between text-sm font-medium hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>Terms & Conditions</span>
                    </div>
                    {showTerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showTerms && (
                    <div className="px-3 pb-3 space-y-2 text-xs text-muted-foreground border-t border-border pt-3">
                      <p>1. This is a digital course purchase. No physical delivery is applicable unless a hardware kit is ordered separately.</p>
                      <p>2. Course access is non-transferable and linked to your registered account only.</p>
                      <p>3. Refund requests must be submitted within 7 days of purchase. After 7 days, no refund will be processed.</p>
                      <p>4. Learn With RT reserves the right to modify, update, or remove course content at any time.</p>
                      <p>5. Payment is processed via UPI. Ensure the correct amount is sent to the UPI ID displayed above.</p>
                      <p>6. Access to course materials will be granted only after payment verification.</p>
                      <p>7. Any misuse of course content, including sharing or redistribution, is strictly prohibited.</p>
                      <p>8. By completing this payment, you agree to all terms and conditions of Learn With RT.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UPIPayment;
