
import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const video = videoRef.current;
    
    qrScannerRef.current = new QrScanner(
      video,
      (result) => {
        console.log('QR Code detected:', result.data);
        onScan(result.data);
        cleanup();
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    qrScannerRef.current.start().catch((err) => {
      console.error('Failed to start QR scanner:', err);
      setError('Camera access denied or not available');
      setHasCamera(false);
    });

    return cleanup;
  }, [isOpen, onScan]);

  const cleanup = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan QR Code
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {hasCamera ? (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                playsInline
              />
              <div className="absolute inset-4 border-2 border-primary rounded-lg pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Position the QR code within the frame to scan
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              {error || 'Camera not available'}
            </p>
            <p className="text-xs text-muted-foreground">
              Please ensure camera permissions are granted and try again
            </p>
          </div>
        )}

        <Button
          onClick={onClose}
          variant="outline"
          className="w-full mt-4"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
