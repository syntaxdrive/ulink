import { useState } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCw } from 'lucide-react';

interface ImageCropperProps {
    imageUrl: string;
    onCropComplete: (croppedImageBlob: Blob) => void;
    onCancel: () => void;
    aspectRatio?: number;
}

export default function ImageCropper({ imageUrl, onCropComplete, onCancel, aspectRatio = 1 }: ImageCropperProps) {
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 80,
        height: aspectRatio === 1 ? 80 : 60,
        x: 10,
        y: aspectRatio === 1 ? 10 : 20
    });
    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
    const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
    const [rotation, setRotation] = useState(0);

    const handleCropComplete = async () => {
        if (!imgRef) return;

        let finalCrop = completedCrop;
        if (!finalCrop) {
            if (crop.unit === '%') {
                finalCrop = {
                    unit: 'px',
                    width: (crop.width * imgRef.width) / 100,
                    height: (crop.height * imgRef.height) / 100,
                    x: (crop.x * imgRef.width) / 100,
                    y: (crop.y * imgRef.height) / 100
                };
            } else {
                finalCrop = crop;
            }
        }

        if (!finalCrop || !finalCrop.width || !finalCrop.height) return;

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.naturalWidth / imgRef.width;
        const scaleY = imgRef.naturalHeight / imgRef.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        const pixelRatio = window.devicePixelRatio;
        canvas.width = finalCrop.width * scaleX * pixelRatio;
        canvas.height = finalCrop.height * scaleY * pixelRatio;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        // Apply rotation
        if (rotation !== 0) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);
        }

        ctx.drawImage(
            imgRef,
            finalCrop.x * scaleX,
            finalCrop.y * scaleY,
            finalCrop.width * scaleX,
            finalCrop.height * scaleY,
            0,
            0,
            finalCrop.width * scaleX,
            finalCrop.height * scaleY
        );

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    onCropComplete(blob);
                }
            },
            'image/jpeg',
            0.95
        );
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">Crop Image</h2>
                        <p className="text-sm text-stone-600 dark:text-zinc-400 mt-1">Drag to reposition • Resize corners to zoom</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4 flex justify-center">
                        <button
                            onClick={handleRotate}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                            <RotateCw className="w-4 h-4" />
                            Rotate 90°
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspectRatio}
                            circularCrop={aspectRatio === 1}
                        >
                            <img
                                ref={setImgRef}
                                src={imageUrl}
                                alt="Crop preview"
                                style={{
                                    maxHeight: '60vh',
                                    transform: `rotate(${rotation}deg)`
                                }}
                            />
                        </ReactCrop>
                    </div>
                </div>

                <div className="p-6 border-t border-stone-200 dark:border-zinc-800 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 border border-stone-300 dark:border-zinc-700 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCropComplete}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
}
