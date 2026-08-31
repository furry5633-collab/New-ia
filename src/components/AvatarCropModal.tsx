import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Move, Sparkles, RefreshCw } from 'lucide-react';

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (croppedDataUrl: string) => void;
}

export const AvatarCropModal: React.FC<AvatarCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onSave,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset adjustments whenever a new image is loaded
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Generate cropped circular avatar
  const handleCropAndSave = () => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const canvas = document.createElement('canvas');
    const size = 512; // High-definition exported avatar
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport box size in modal (260px)
    const viewportSize = 260;
    const scaleFactor = size / viewportSize;

    ctx.save();
    // Circular clipping
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Background fill
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, size, size);

    // Apply translation to center
    ctx.translate(size / 2 + position.x * scaleFactor, size / 2 + position.y * scaleFactor);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate natural draw dimensions to fit properly
    let drawWidth = viewportSize;
    let drawHeight = viewportSize;

    if (imageSize.width > 0 && imageSize.height > 0) {
      const aspect = imageSize.width / imageSize.height;
      if (aspect > 1) {
        drawHeight = viewportSize * scaleFactor;
        drawWidth = drawHeight * aspect;
      } else {
        drawWidth = viewportSize * scaleFactor;
        drawHeight = drawWidth / aspect;
      }
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onSave(croppedDataUrl);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && imageSrc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-60 flex items-center justify-center p-3 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
            className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-100">Ajustar Foto de Perfil</h3>
                  <p className="text-[11px] text-stone-400">Arrastra, amplía y gira para centrar tu foto</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewport / Crop Arena */}
            <div className="flex flex-col items-center justify-center py-2 select-none">
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative w-[260px] h-[260px] rounded-full overflow-hidden bg-stone-950 border-4 border-amber-400 shadow-2xl cursor-grab active:cursor-grabbing ring-8 ring-amber-500/15"
              >
                {/* Guide hint */}
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                  <div className="w-full h-full border border-dashed border-white/20 rounded-full flex items-center justify-center">
                    {position.x === 0 && position.y === 0 && (
                      <span className="text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                        <Move className="w-3 h-3" /> Arrastra para mover
                      </span>
                    )}
                  </div>
                </div>

                {/* Inner Image transformed */}
                <div
                  className="w-full h-full flex items-center justify-center transition-transform duration-75"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="max-w-none w-[260px] h-[260px] object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>

              <p className="text-[11px] text-stone-400 mt-2.5 flex items-center gap-1">
                <Move className="w-3 h-3 text-amber-400" />
                <span>Mueve la foto para encuadrarla exactamente en el círculo</span>
              </p>
            </div>

            {/* Controls Toolbar */}
            <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
              {/* Zoom Slider */}
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(0.6, Number((prev - 0.15).toFixed(2))))}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 transition cursor-pointer"
                  title="Reducir zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </motion.button>

                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.6"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-[11px] font-mono text-stone-400 w-10 text-right">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, Number((prev + 0.15).toFixed(2))))}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 transition cursor-pointer"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Quick Actions (Rotate & Reset) */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-850 text-xs">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Girar 90°</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className="py-1.5 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center gap-1.5 transition cursor-pointer text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restablecer</span>
                </motion.button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleCropAndSave}
                className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar foto</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
