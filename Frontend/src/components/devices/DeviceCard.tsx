
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Device } from '@/types/auth';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Cpu, Zap } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onDeviceUpdate: () => void;
}

export function DeviceCard({ device, onDeviceUpdate }: DeviceCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      await apiService.toggleDevice(device.device_id, checked ? 'ON' : 'OFF');
      toast({
        title: `Device ${checked ? 'activated' : 'deactivated'}`,
        description: `${device.name} is now ${checked ? 'ON' : 'OFF'}`,
      });
      onDeviceUpdate();
    } catch (error) {
      toast({
        title: "Failed to toggle device",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isOn = device.state === 'ON';

  return (
    <Card className={`device-card ${isOn ? 'glow-effect' : ''} transition-all duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          {device.name}
        </CardTitle>
        <Badge 
          variant={isOn ? "default" : "secondary"}
          className={isOn ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
        >
          {device.state}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Device Control</p>
            <p className="text-xs text-muted-foreground">ID: {device.device_id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className={`h-4 w-4 ${isOn ? 'text-yellow-400' : 'text-gray-400'}`} />
            <Switch
              checked={isOn}
              onCheckedChange={handleToggle}
              disabled={loading}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
        
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isOn ? 'bg-gradient-to-r from-primary to-green-400 w-full' : 'w-0'
            }`}
          />
        </div>
        
        <p className="text-xs text-muted-foreground">
          Status: {isOn ? '🟢 Online' : '🔴 Offline'}
        </p>
      </CardContent>
    </Card>
  );
}
