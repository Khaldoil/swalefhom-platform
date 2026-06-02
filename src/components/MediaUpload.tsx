import React, { useState, useCallback } from 'react';
import { Upload, X, Film, Image as ImageIcon, Plus } from 'lucide-react';
import { uploadMultipleMedia } from '../lib/storage';
import Button from './Button';

interface MediaFile {
  url: string;
  type: 'image' | 'video';
}

interface MediaUploadProps {
  onUpload: (files: MediaFile[]) => void;
  currentMedia?: MediaFile[];
  onRemove?: (index: number) => void;
  type?: 'image' | 'video' | 'both';
  maxFiles?: number;
}

export default function MediaUpload({ 
  onUpload, 
  currentMedia = [], 
  onRemove, 
  type = 'both',
  maxFiles = 5 
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>(currentMedia);

  const acceptTypes = {
    image: 'image/*',
    video: 'video/*',
    both: 'image/*,video/*'
  };

  const handleUpload = async (files: FileList) => {
    if (uploadedFiles.length + files.length > maxFiles) {
      setError(`يمكنك رفع ${maxFiles} ملفات كحد أقصى`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileArray = Array.from(files);
      const urls = await uploadMultipleMedia(fileArray);
      
      const newFiles = urls.map((url, index) => ({
        url,
        type: fileArray[index].type.startsWith('image/') ? 'image' : 'video' as const
      }));

      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      onUpload(updatedFiles);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء رفع الملفات');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onUpload(newFiles);
    if (onRemove) onRemove(index);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-[#FAC39B] bg-[#FAC39B]/10'
            : 'border-white/20 hover:border-white/40'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept={acceptTypes[type]}
          onChange={handleFileChange}
          className="hidden"
          id="media-upload"
          multiple
        />
        <label
          htmlFor="media-upload"
          className="cursor-pointer block"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            {(type === 'both' || type === 'image') && (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
            {(type === 'both' || type === 'video') && (
              <Film className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <p className="text-gray-400 mb-2">اضغط هنا أو اسحب الملفات لرفعها</p>
          <p className="text-gray-500 text-sm">
            {type === 'both' && 'صور (حتى 5 ميجابايت) أو فيديو (حتى 20 ميجابايت)'}
            {type === 'image' && 'PNG, JPG, GIF حتى 5 ميجابايت'}
            {type === 'video' && 'MP4, WebM حتى 20 ميجابايت'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            يمكنك رفع حتى {maxFiles} ملفات
          </p>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Loading State */}
      {isUploading && (
        <Button isLoading className="w-full">
          جاري الرفع...
        </Button>
      )}

      {/* Preview Grid */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video rounded-lg overflow-hidden bg-white/5">
                {file.type === 'image' ? (
                  <img
                    src={file.url}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
              <button
                onClick={() => handleRemoveFile(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {/* Upload More Button */}
          {uploadedFiles.length < maxFiles && (
            <label
              htmlFor="media-upload"
              className="aspect-video rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-400">إضافة المزيد</span>
              </div>
            </label>
          )}
        </div>
      )}
    </div>
  );
}