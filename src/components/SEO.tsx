import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  keywords?: string;
}

export default function SEO({
  title = 'سواليفهم - سواليفهم إرث، وحفظها عهد',
  description = 'منصة سواليفهم هي مبادرة ثقافية لتوثيق وحفظ القصص والأحداث التي عاشها أجدادنا وآباؤنا في المملكة العربية السعودية. انضم إلينا في رحلة الحفاظ على تراثنا للأجيال القادمة.',
  image = 'https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png',
  type = 'website',
  keywords = 'سواليفهم, التراث السعودي, قصص الأجداد, توثيق التراث, الثقافة السعودية, القصص الشفهية, التاريخ السعودي, الموروث الثقافي'
}: SEOProps) {
  const location = useLocation();
  const siteUrl = 'https://sawalifhum.com';
  const currentUrl = `${siteUrl}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'سواليفهم');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('language', 'Arabic');
    updateMetaTag('revisit-after', '7 days');

    // Open Graph meta tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'سواليفهم', true);
    updateMetaTag('og:locale', 'ar_SA', true);

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@sawalifhum');
    updateMetaTag('twitter:creator', '@sawalifhum');

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

    // Update lang attribute
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';

  }, [title, description, image, type, keywords, currentUrl]);

  return null;
}
