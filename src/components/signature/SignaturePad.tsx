import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
  label?: string;
  savedSignature?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  width = 400,
  height = 200,
  label,
  savedSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(!!savedSignature);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Style
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Restore saved signature
    if (savedSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = savedSignature;
    }
  }, [width, height, savedSignature]);

  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasContent(true);
  }, [getPosition]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, getPosition]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasContent(false);
    onClear?.();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-semibold text-right text-foreground">{label}</p>
      )}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl overflow-hidden bg-white",
          "border-muted-foreground/30 hover:border-primary/50 transition-colors"
        )}
      >
        <canvas
          ref={canvasRef}
          style={{ width, height, touchAction: 'none', cursor: 'crosshair' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="rounded-lg"
        >
          <Eraser className="h-4 w-4 ml-1" />
          נקה
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!hasContent}
          className="rounded-lg"
        >
          <Check className="h-4 w-4 ml-1" />
          אישור
        </Button>
      </div>
    </div>
  );
};
