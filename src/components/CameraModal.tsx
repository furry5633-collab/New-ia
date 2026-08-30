import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { canvasToProcessedImage, ProcessedImage } from '../utils/imageHelper';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: ProcessedImage) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<ProcessedImage | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanupStream();
      setCapturedPhoto(null);
      setError(null);
      return;
    }

    startCamera();

    return () => {
      cleanupStream();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    cleanupStream();
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('No se pudo acceder a la cámara. Por favor permite los permisos o sube una imagen directamente.');
    }
  };

  const cleanupStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const processed = canvasToProcessedImage(canvas);
    setCapturedPhoto(processed);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const toggleFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-stone-100">
              Tomar foto del ejercicio de matemáticas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[340px] sm:min-h-[420px] overflow-hidden">
          {error ? (
            <div className="p-6 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <p className="text-stone-300 text-sm mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-sm transition cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          ) : capturedPhoto ? (
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <img
                src={capturedPhoto.previewUrl}
                alt="Foto capturada"
                className="max-h-[420px] max-w-full rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[440px]"
              />
              {/* Guidelines overlay for math worksheet */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-amber-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="bg-stone-900/80 backdrop-blur-sm self-center text-amber-200 text-xs px-3 py-1 rounded-full border border-amber-400/30">
                  Encuadra la ecuación o el paso que estás resolviendo
                </div>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          {!capturedPhoto ? (
            <>
              <button
                onClick={toggleFacing}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs sm:text-sm transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Girar Cámara</span>
              </button>

              <button
                id="btn-shutter-capture"
                onClick={handleCapture}
                className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 p-1 flex items-center justify-center shadow-lg transition transform active:scale-95 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full border-2 border-stone-950 bg-white flex items-center justify-center">
                  <Camera className="w-5 h-5 text-stone-900" />
                </div>
              </button>

              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg text-stone-400 hover:text-stone-200 text-xs sm:text-sm transition cursor-pointer"
              >
                Cancelar
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={handleRetake}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-medium transition cursor-pointer"
              >
                Tomar otra
              </button>
              <button
                id="btn-use-captured-photo"
                onClick={handleConfirm}
                className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm shadow transition cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Usar esta foto</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
