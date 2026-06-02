import React, { useState, useCallback } from 'react';
import { Upload, X, Film, Image as ImageIcon, Plus, Mic } from 'lucide-react';
import { uploadMedia } from '../lib/storage';
import Button from './Button';
import { useToast } from '../hooks/useToast';

interface MediaFile {
  file: File;
  type: 'image' | 'video' | 'audio';
  preview?: string;
}

interface MultiMediaUploadProps {
  onUpload: (files: { url: string; type: string }[]) => void;
  currentMedia?: { url: string; type: string }[] | null;
  onRemove?: (index: number) => void;
  type?: 'image' | 'video' | 'audio' | 'both';
  maxFiles?: number;
}

export default function MultiMediaUpload({ 
  onUpload, 
  currentMedia = [], 
  onRemove, 
  type = 'both',
  maxFiles = 10
}: MultiMediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const { addToast } = useToast();

  const acceptTypes = {
    image: 'image/*',
    video: 'video/*',
    audio: 'audio/*',
    both: 'image/*,video/*,audio/*'
  };

  const handleUpload = async (files: FileList) => {
    if (mediaFiles.length + files.length > maxFiles) {
      addToast(`يمكنك رفع ${maxFiles} ملفات كحد أقصى`, 'error');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        
        // Validate file type based on the selected type
        if (type === 'image' && !isImage) {
          throw new Error('يرجى رفع ملف صورة فقط');
        }
        if (type === 'video' && !isVideo) {
          throw new Error('يرجى رفع ملف فيديو فقط');
        }
        if (type === 'audio' && !isAudio) {
          throw new Error('يرجى رفع ملف صوتي فقط');
        }
        if (!isImage && !isVideo && !isAudio) {
          throw new Error('يرجى رفع ملف صورة أو فيديو أو صوت صالح');
        }

        // Validate file size
        const maxSize = isVideo ? 20 * 1024 * 1024 : isAudio ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(
            isVideo 
              ? 'حجم الفيديو يجب ألا يتجاوز 20 ميجابايت'
              : isAudio
              ? 'حجم الملف الصوتي يجب ألا يتجاوز 10 ميجابايت'
              : 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت'
          );
        }

        try {
          const url = await uploadMedia(file);
          return {
            url,
            type: isImage ? 'image' : isVideo ? 'video' : 'audio'
          };
        } catch (err: any) {
          console.error('Upload error:', err);
          throw new Error(err.message || 'فشل في رفع الملف');
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<{url: string; type: string}> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);

      const failedUploads = results
        .filter((result): result is PromiseRejectedResult => 
          result.status === 'rejected'
        );

      if (successfulUploads.length > 0) {
        onUpload(successfulUploads);
        if (failedUploads.length > 0) {
          addToast(`تم رفع ${successfulUploads.length} ملف(ات) بنجاح، وفشل رفع ${failedUploads.length} ملف(ات)`, 'info');
        } else {
          addToast('تم رفع الملفات بنجاح', 'success');
        }
      } else if (failedUploads.length > 0) {
        throw new Error(failedUploads[0].reason.message || 'فشل في رفع الملفات');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'حدث خطأ أثناء رفع الملفات');
      addToast(err.message || 'حدث خطأ أثناء رفع الملفات', 'error');
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

  const getTypeIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-gray-400" />;
      case 'video':
        return <Film className="w-8 h-8 text-gray-400" />;
      case 'audio':
        return <Mic className="w-8 h-8 text-gray-400" />;
      default:
        return (
          <div className="flex items-center justify-center gap-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
            <Film className="w-8 h-8 text-gray-400" />
            <Mic className="w-8 h-8 text-gray-400" />
          </div>
        );
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'image':
        return 'صور (حتى 5 ميجابايت)';
      case 'video':
        return 'فيديو (حتى 20 ميجابايت)';
      case 'audio':
        return 'ملف صوتي (حتى 10 ميجابايت)';
      default:
        return 'صور (حتى 5 ميجابايت) أو فيديو (حتى 20 ميجابايت) أو صوت (حتى 10 ميجابايت)';
    }
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
          multiple={maxFiles > 1}
          disabled={isUploading}
        />
        <label
          htmlFor="media-upload"
          className={`cursor-pointer block ${isUploading ? 'pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-[#FAC39B] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#FAC39B]">جاري رفع الملفات...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-4 mb-4">
                {getTypeIcon()}
              </div>
              <p className="text-gray-400 mb-2">اضغط هنا أو اسحب الملفات لرفعها</p>
              <p className="text-gray-500 text-sm">{getTypeLabel()}</p>
              <p className="text-gray-500 text-sm mt-2">
                يمكنك رفع حتى {maxFiles} ملفات
              </p>
            </>
          )}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Preview Grid */}
      {currentMedia && currentMedia.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {currentMedia.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video rounded-lg overflow-hidden bg-white/5">
                {file.type === 'image' ? (
                  <img
                    src={file.url}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : file.type === 'video' ? (
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Mic className="w-12 h-12 text-gray-400" />
                    <audio
                      src={file.url}
                      controls
                      className="absolute bottom-0 left-0 right-0"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => onRemove?.(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {/* Upload More Button */}
          {currentMedia.length < maxFiles && (
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