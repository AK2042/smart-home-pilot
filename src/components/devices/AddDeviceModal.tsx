
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, QrCode, Scan } from 'lucide-react';

interface AddDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeviceAdded: () => void;
}

export function AddDeviceModal({ open, onOpenChange, onDeviceAdded }: AddDeviceModalProps) {
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId.trim()) return;

    setLoading(true);
    try {
      await apiService.registerDevice({
        id: deviceId,
        name: deviceName.trim() || 'Unnamed Device'
      });
      
      toast({
        title: "Device registered successfully!",
        description: `${deviceName || 'Device'} has been added to your dashboard.`,
      });
      
      onDeviceAdded();
      handleClose();
    } catch (error) {
      toast({
        title: "Failed to register device",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDeviceId('');
    setDeviceName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Register New Device
          </DialogTitle>
          <DialogDescription>
            Scan the QR code on your Arduino device or enter the device ID manually.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceId">Device ID *</Label>
            <div className="relative">
              <Input
                id="deviceId"
                type="text"
                placeholder="Enter device ID from QR code"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                required
                className="bg-white/5 border-white/10 focus:border-primary/50 pr-10"
              />
              <QrCode className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Scan the QR code on your Arduino device to get the device ID
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deviceName">Device Name (Optional)</Label>
            <Input
              id="deviceName"
              type="text"
              placeholder="e.g., Living Room Light"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
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
              disabled={loading || !deviceId.trim()}
              className="flex-1 bg-gradient-to-r from-primary to-purple-600"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Registering...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-4 w-4" />
                  Register Device
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
