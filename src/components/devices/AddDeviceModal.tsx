
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, QrCode, Download } from 'lucide-react';

interface AddDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeviceAdded: () => void;
}

export function AddDeviceModal({ open, onOpenChange, onDeviceAdded }: AddDeviceModalProps) {
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{ qr: string; topic: string; device_id: string } | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    setLoading(true);
    try {
      const result = await apiService.addDevice(deviceName);
      setQrData({
        qr: result.qr,
        topic: result.topic,
        device_id: result.device_id
      });
      toast({
        title: "Device added successfully!",
        description: `${deviceName} is ready to be configured.`,
      });
      onDeviceAdded();
    } catch (error) {
      toast({
        title: "Failed to add device",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDeviceName('');
    setQrData(null);
    onOpenChange(false);
  };

  const downloadQR = () => {
    if (!qrData) return;
    
    const link = document.createElement('a');
    link.href = qrData.qr;
    link.download = `${qrData.device_id}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add New Device
          </DialogTitle>
          <DialogDescription>
            {qrData ? 
              "Scan this QR code with your Arduino device to connect it to your network." :
              "Enter a name for your new IoT device."
            }
          </DialogDescription>
        </DialogHeader>

        {!qrData ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                type="text"
                placeholder="e.g., Living Room Light"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
                className="bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-white/10 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading || !deviceName.trim()}
                className="flex-1 bg-gradient-to-r from-primary to-purple-600"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Device
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <img 
                  src={qrData.qr} 
                  alt="Device QR Code" 
                  className="w-48 h-48"
                />
              </div>
            </div>
            
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium">Device ID: {qrData.device_id}</p>
              <p className="text-xs text-muted-foreground break-all">
                Topic: {qrData.topic}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={downloadQR}
                variant="outline"
                className="flex-1 border-white/10 hover:bg-white/5"
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR
              </Button>
              <Button 
                onClick={handleClose}
                className="flex-1 bg-gradient-to-r from-primary to-purple-600"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
