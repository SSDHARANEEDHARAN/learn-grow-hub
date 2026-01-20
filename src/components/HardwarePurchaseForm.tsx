import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Package, Cpu, CircuitBoard, Zap, Check } from 'lucide-react';

interface HardwareKit {
  id: string;
  name: string;
  description: string;
  price: number;
  items: string[];
  icon: React.ReactNode;
}

const hardwareKits: HardwareKit[] = [
  {
    id: 'arduino-starter',
    name: 'Arduino Starter Kit',
    description: 'Complete kit for Arduino courses',
    price: 2999,
    items: ['Arduino UNO R3', 'Breadboard', 'LED Pack', 'Resistors', 'Jumper Wires', 'Sensors Pack'],
    icon: <Cpu className="w-6 h-6" />,
  },
  {
    id: 'raspberry-pi-kit',
    name: 'Raspberry Pi Kit',
    description: 'Full Raspberry Pi learning kit',
    price: 5999,
    items: ['Raspberry Pi 4 4GB', 'Power Supply', 'SD Card 32GB', 'Case', 'GPIO Kit', 'Camera Module'],
    icon: <CircuitBoard className="w-6 h-6" />,
  },
  {
    id: 'esp32-iot',
    name: 'ESP32 IoT Kit',
    description: 'WiFi & Bluetooth development kit',
    price: 1999,
    items: ['ESP32 DevKit', 'OLED Display', 'DHT22 Sensor', 'Relay Module', 'PIR Sensor', 'Cables'],
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: 'advanced-robotics',
    name: 'Advanced Robotics Kit',
    description: 'Build autonomous robots',
    price: 8999,
    items: ['Robot Chassis', 'Motors & Drivers', 'Arduino Mega', 'Ultrasonic Sensors', 'Servo Pack', 'Battery Pack'],
    icon: <Package className="w-6 h-6" />,
  },
];

interface HardwarePurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  courseTitle?: string;
}

const HardwarePurchaseForm = ({ isOpen, onClose, courseId, courseTitle }: HardwarePurchaseFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedKitData = hardwareKits.find(k => k.id === selectedKit);
  const totalAmount = selectedKitData ? selectedKitData.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedKit) {
      toast({
        title: 'Error',
        description: 'Please select a hardware kit',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
      
      const { error } = await supabase
        .from('hardware_orders')
        .insert({
          user_id: user.id,
          course_id: courseId || null,
          hardware_type: selectedKit,
          quantity,
          shipping_address: fullAddress,
          phone: formData.phone,
          amount: totalAmount,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Order Placed!',
        description: 'Your hardware order has been placed. Payment link will be sent to your email.',
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Live Hardware Kit
          </DialogTitle>
          <DialogDescription>
            Get hands-on practice with real hardware components
            {courseTitle && <span> for {courseTitle}</span>}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Hardware Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Select Hardware Kit</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {hardwareKits.map((kit) => (
                <div
                  key={kit.id}
                  onClick={() => setSelectedKit(kit.id)}
                  className={`p-4 border cursor-pointer transition-all ${
                    selectedKit === kit.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                      {kit.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{kit.name}</h4>
                        {selectedKit === kit.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{kit.description}</p>
                      <p className="text-lg font-bold mt-2">₹{kit.price.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {kit.items.slice(0, 4).map((item, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-secondary">
                          {item}
                        </span>
                      ))}
                      {kit.items.length > 4 && (
                        <span className="text-xs px-2 py-0.5 bg-muted">
                          +{kit.items.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedKit && (
            <>
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                  <span className="text-muted-foreground">
                    Total: <span className="text-foreground font-bold">₹{totalAmount.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">Shipping Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House/Flat No., Street, Landmark"
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="XXXXXX"
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || !selectedKit}>
              {isSubmitting ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HardwarePurchaseForm;
