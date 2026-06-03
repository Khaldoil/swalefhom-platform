import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Calendar, 
  User, 
  Tag, 
  Share2, 
  Facebook, 
  Copy, 
  Check,
  Clock,
  PenTool
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import ShareModal from '../components/ShareModal';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  category_id: string | null;
  author: string;
  created_at: string;
  categories?: {
    id: string;
    name: string;
  };
}

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/blog');
      return;
    }
    loadPost();
  }, [id, navigate]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load main post
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*, categories(*)')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (postError) throw postError;
      if (!postData) {
        setError('المقال غير موجود');
        return;
      }

      setPost(postData);

      // Only load related posts if we have a category_id
      if (postData.category_id) {
        const { data: relatedData, error: relatedError } = await supabase
          .from('blog_posts')
          .select('*, categories(*)')
          .eq('status', 'published')
          .eq('category_id', postData.category_id)
          .neq('id', postData.id)
          .limit(3);

        if (relatedError) throw relatedError;
        setRelatedPosts(relatedData || []);
      }

    } catch (err) {
      console.error('Error loading post:', err);
      setError('حدث خطأ أثناء تحميل المقال');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (platform: 'x' | 'facebook' | 'whatsapp' | 'copy') => {
    if (!post) return;

    const url = window.location.href;
    const text = `${post.title} - سواليفهم`;
    const hashtags = 'سواليفهم,تراث,قصص_أجدادنا';

    switch (platform) {
      case 'x':
        window.open(
          `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      case 'whatsapp':
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n\n${url}`)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy URL:', err);
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              {error || 'المقال غير موجود'}
            </h1>
            <Link to="/blog" className="text-[#FAC39B] hover:text-white transition-colors">
              العودة إلى المدونة
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const readingTime = Math.ceil(post.content.split(' ').length / 200); // Assuming 200 words per minute

  return (
    <div className="min-h-screen bg-[#0F2837]">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[600px]">
        <div className="absolute inset-0">
          <img
            src={post.image_url || 'https://images.unsplash.com/photo-1583795879453-c83e3a5e2212?q=80&w=1000'}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2837]/80 via-[#0F2837]/50 to-[#0F2837]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          {/* Back Button */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[#FAC39B] hover:text-white transition-colors mb-8 bg-[#0F2837]/50 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <ArrowRight className="w-5 h-5" />
            العودة إلى المدونة
          </Link>

          {/* Category Badge */}
          {post.categories && (
            <div className="mb-6">
              <span className="bg-[#91B9B4] text-white px-4 py-2 rounded-full text-sm inline-flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {post.categories.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#FAC39B]" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FAC39B]" />
              <span>{new Date(post.created_at).toLocaleDateString('ar-SA')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FAC39B]" />
              <span>{readingTime} دقيقة قراءة</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        {/* Share Buttons */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-8 flex items-center gap-4 border border-white/10">
          <div className="text-white flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <span>شارك المقال</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleShare('x')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hover:text-[#1DA1F2]"
              title="شارك على X"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#4267B2] hover:text-white"
              title="شارك على فيسبوك"
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#25D366] hover:text-white"
              title="شارك على واتساب"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="انسخ الرابط"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-[#FAC39B] text-[#0F2837] rounded-lg hover:bg-[#FF9619] transition-colors flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              أخبر صديق
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-white/10">
          <div className="prose prose-lg prose-invert max-w-none">
            {post.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-300 mb-6 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8">مقالات ذات صلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.id}`}
                  className="group"
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="aspect-video relative">
                      <img
                        src={relatedPost.image_url || 'https://images.unsplash.com/photo-1583795879453-c83e3a5e2212?q=80&w=1000'}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 right-4">
                          <PenTool className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-[#FAC39B] transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={post.title}
        url={window.location.href}
      />

      <Footer />
    </div>
  );
}