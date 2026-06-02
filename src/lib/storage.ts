import { supabase } from './supabase';

export async function uploadMedia(file: File): Promise<string> {
  try {
    // Validate file type with more precise detection
    const isImage = /^image\/(jpeg|png|gif|webp)$/i.test(file.type);
    const isVideo = /^video\/(mp4|webm|ogg)$/i.test(file.type);
    const isAudio = /^audio\/(mp3|wav|ogg|mpeg)$/i.test(file.type);
    
    if (!isImage && !isVideo && !isAudio) {
      throw new Error('يرجى رفع ملف صورة أو فيديو أو صوت');
    }

    // Validate file size (20MB max for videos, 10MB for audio, 5MB for images)
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

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt) {
      throw new Error('امتداد الملف غير صالح');
    }

    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from('stories')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      if (uploadError.message.includes('duplicate')) {
        throw new Error('تم رفع هذا الملف مسبقاً');
      }
      throw new Error('فشل في رفع الملف، يرجى المحاولة مرة أخرى');
    }

    if (!data?.path) {
      throw new Error('فشل في رفع الملف، يرجى المحاولة مرة أخرى');
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('stories')
      .getPublicUrl(data.path);

    if (!publicUrl) {
      throw new Error('فشل في الحصول على رابط الملف');
    }

    return publicUrl;
  } catch (error) {
    // Ensure we always throw an Error object with a message
    if (error instanceof Error) {
      throw error;
    }
    // If it's not an Error object, create one with a default message
    throw new Error('حدث خطأ غير متوقع أثناء رفع الملف');
  }
}

export async function uploadMultipleMedia(files: File[]): Promise<string[]> {
  if (!files.length) {
    throw new Error('لم يتم اختيار أي ملفات');
  }

  try {
    const uploadPromises = files.map(file => uploadMedia(file));
    const results = await Promise.allSettled(uploadPromises);
    
    // Collect successful uploads and errors
    const successfulUploads: string[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulUploads.push(result.value);
      } else {
        errors.push(`فشل في رفع الملف ${files[index].name}: ${result.reason.message}`);
      }
    });

    if (successfulUploads.length === 0) {
      throw new Error(errors.join('\n'));
    }

    if (errors.length > 0) {
      console.warn('Some files failed to upload:', errors);
    }

    return successfulUploads;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('حدث خطأ غير متوقع أثناء رفع الملفات');
  }
}

export async function deleteMedia(url: string): Promise<void> {
  try {
    const fileName = url.split('/').pop();
    if (!fileName) {
      throw new Error('رابط الملف غير صالح');
    }

    const { error } = await supabase.storage
      .from('stories')
      .remove([fileName]);

    if (error) {
      throw new Error('فشل في حذف الملف، يرجى المحاولة مرة أخرى');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('حدث خطأ غير متوقع أثناء حذف الملف');
  }
}