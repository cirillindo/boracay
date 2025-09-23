// src/components/blog/DynamicBlogContent.tsx
import React, { useState, useEffect } from 'react';
import { Ship, Sun, Shell, Map, Wind, Cog as Yoga, MessageCircle as Massage, Bike, Dumbbell, DollarSign, Palmtree, ShoppingBag, Landmark, Waves, Sunset, Sailboat, Umbrella, Activity, Utensils } from 'lucide-react';
import { BlogSection } from '../../types';
import Accordion from '../ui/Accordion';

interface DynamicBlogContentProps {
  rawContent: string;
}

const DynamicBlogContent: React.FC<DynamicBlogContentProps> = ({ rawContent }) => {
  const [sections, setSections] = useState<BlogSection[]>([]);

  useEffect(() => {
    if (!rawContent) return;

    // Split content into sections by the "---" delimiter
    const rawSections = rawContent.split('---').filter(section => section.trim().length > 0);

    const parsedSections = rawSections.map((section, index) => {
      // Extract section title
      const titleMatch = section.match(/## \d+\.\s+(.+)/);
      const title = titleMatch ? titleMatch[1] : `Section ${index + 1}`;

      // Extract YouTube URLs
      const youtubeUrls: string[] = [];
      const youtubeMatches = section.matchAll(/YouTube:\s+(\S+)/g);
      for (const match of youtubeMatches) {
        if (match[1]) youtubeUrls.push(match[1]);
      }

      // Extract image URLs
      const galleryMatch = section.match(/Gallery:(.+?)(?=\n\n|\n$|$)/s);
      const images: string[] = [];

      if (galleryMatch) {
        const galleryContent = galleryMatch[1];
        const urlMatches = galleryContent.match(/https?:\/\/\S+/g);
        if (urlMatches) {
          images.push(...urlMatches);
        }
      }

      // Remove title, YouTube, and Gallery sections from content
      let content = section
        .replace(/## \d+\.\s+.+\n/, '') // Remove title
        .replace(/YouTube:\s+\S+\n?/g, '') // Remove YouTube lines
        .replace(/Gallery:(.+?)(?=\n\n|\n$|$)/s, ''); // Remove Gallery section

      // Clean up content
      content = content.trim();

      // Determine icon based on title keywords
      let icon;
      const titleLower = title.toLowerCase();

      if (titleLower.includes('island hopping')) {
        icon = <Ship />;
      } else if (titleLower.includes('sunset')) {
        icon = <Sun />;
      } else if (titleLower.includes('puka beach')) {
        icon = <Shell />;
      } else if (titleLower.includes('iligan beach')) {
        icon = <Umbrella />;
      } else if (titleLower.includes('diniwid beach')) {
        icon = <Palmtree />;
      } else if (titleLower.includes('kitesurfing')) {
        icon = <Wind />;
      } else if (titleLower.includes('wellness') || titleLower.includes('yoga')) {
        icon = <Yoga />;
      } else if (titleLower.includes('massage') || titleLower.includes('spa')) {
        icon = <Massage />;
      } else if (titleLower.includes('get around')) {
        icon = <Bike />;
      } else if (titleLower.includes('sports club') || titleLower.includes('activity group')) {
        icon = <Activity />;
      } else if (titleLower.includes('fitness') || titleLower.includes('gym')) {
        icon = <Dumbbell />;
      } else if (titleLower.includes('money')) {
        icon = <DollarSign />;
      } else if (titleLower.includes('shopping') || titleLower.includes('market')) {
        icon = <ShoppingBag />;
      } else if (titleLower.includes('willy')) {
        icon = <Landmark />;
      } else if (titleLower.includes('bar')) {
        icon = <Utensils />;
      } else if (titleLower.includes('cruise') || titleLower.includes('sailing')) {
        icon = <Sailboat />;
      } else {
        icon = <Map />;
      }

      return {
        id: `section-${index}`,
        title,
        content,
        images,
        youtubeUrls,
        icon
      };
    });

    setSections(parsedSections);
  }, [rawContent]);

  const getYoutubeEmbedUrl = (url: string) => {
    // Convert various YouTube URL formats to embed URL
    const regExp = /^.*(youtu.be\/|v\/|e\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }

    return url; // Return original if not a valid YouTube URL
  };

  // Function to render content with clickable links
  const renderContent = (content: string) => {
    // Split content into paragraphs
    return content.split('\n\n').map((paragraph, idx) => {
      // Check if paragraph is a list
      if (paragraph.includes('* **')) {
        const listItems = paragraph.split('\n').filter(item => item.trim());
        return (
          <div key={idx} className="my-4">
            <ul className="list-disc pl-5 space-y-2">
              {listItems.map((item, itemIdx) => {
                // Extract bold text if present
                const boldMatch = item.match(/\*\*([^*]+)\*\*/);
                if (boldMatch) {
                  const parts = item.split('**');
                  return (
                    <li key={itemIdx} className="text-gray-700">
                      <strong>{parts[1]}</strong>
                      <span dangerouslySetInnerHTML={{ __html: parts[2] || '' }} />
                    </li>
                  );
                }
                return (
                  <li key={itemIdx} className="text-gray-700">
                    <span dangerouslySetInnerHTML={{ __html: item.replace('* ', '') }} />
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }

      // Check if paragraph is a list with bullet points
      if (paragraph.includes('•\t')) {
        const listItems = paragraph.split('\n').filter(item => item.trim());
        return (
          <div key={idx} className="my-4">
            <ul className="list-disc pl-5 space-y-2">
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx} className="text-gray-700">
                  <span dangerouslySetInnerHTML={{ __html: item.replace('•\t', '') }} />
                </li>
               ))}
            </ul>
          </div>
        );
      }

      // Regular paragraph with bold text processing
      if (paragraph.includes('**')) {
        let processedParagraph = paragraph;
        const boldRegex = /\*\*([^*]+)\*\*/g;
        processedParagraph = processedParagraph.replace(boldRegex, '<strong>$1</strong>');

        return (
          <p key={idx} className="text-gray-700">
            <span dangerouslySetInnerHTML={{ __html: processedParagraph }} />
          </p>
        );
      }

      return (
        <p key={idx} className="text-gray-700">
          <span dangerouslySetInnerHTML={{ __html: paragraph }} />
        </p>
      );
    });
  };

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <Accordion
          key={section.id}
          title={section.title}
          icon={section.icon}
          defaultOpen={false} // Corrected: Changed to false to make dropdowns closed by default
        >
          <div className="space-y-6">
            {/* Main content */}
            <div className="prose max-w-none">
              {renderContent(section.content)}
            </div>

            {/* YouTube videos if present */}
            {section.youtubeUrls && section.youtubeUrls.length > 0 && (
              <div className="space-y-4">
                {section.youtubeUrls.map((url, idx) => (
                  <div key={idx} className="aspect-video w-full rounded-lg overflow-hidden">
                    <iframe
                      src={getYoutubeEmbedUrl(url)}
                      title={`YouTube video for ${section.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                ))}
              </div>
            )}

            {/* Images gallery if present */}
            {section.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.images.map((imageUrl, idx) => (
                  <div key={idx} className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`${section.title} - image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Accordion>
      ))}
    </div>
  );
};

export default DynamicBlogContent;
