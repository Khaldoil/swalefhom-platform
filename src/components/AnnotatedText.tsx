import React, { useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Annotation {
  id: string;
  selected_text: string;
  annotation: string;
  start_position: number;
  end_position: number;
  color: string;
}

interface AnnotatedTextProps {
  text: string;
  storyId: string;
  className?: string;
}

export default function AnnotatedText({ text, storyId, className = '' }: AnnotatedTextProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnnotations();
  }, [storyId]);

  const loadAnnotations = async () => {
    try {
      const { data, error } = await supabase
        .from('story_annotations')
        .select('*')
        .eq('story_id', storyId)
        .order('start_position', { ascending: true });

      if (error) throw error;
      setAnnotations(data || []);
    } catch (error) {
      console.error('Error loading annotations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAnnotatedText = () => {
    if (annotations.length === 0) {
      return text;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedAnnotations = [...annotations].sort((a, b) => a.start_position - b.start_position);

    sortedAnnotations.forEach((annotation, index) => {
      if (annotation.start_position > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, annotation.start_position)}
          </span>
        );
      }

      const annotatedText = text.substring(
        annotation.start_position,
        annotation.end_position
      );

      parts.push(
        <span
          key={`annotation-${annotation.id}`}
          className="group relative inline-block cursor-help mx-0.5"
        >
          <span
            className="relative inline-block transition-all duration-200"
            style={{
              background: `linear-gradient(180deg, transparent 65%, ${annotation.color}50 65%)`,
              borderBottom: `2px solid ${annotation.color}`,
              paddingBottom: '2px'
            }}
          >
            {annotatedText}
            <Info
              className="inline-block w-3 h-3 mr-0.5 opacity-70"
              style={{
                verticalAlign: 'super',
                color: annotation.color,
                marginRight: '2px'
              }}
            />
          </span>

          {/* Tooltip - يظهر عند hover */}
          <span
            className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute z-50 transition-all duration-300 ease-out pointer-events-none"
            style={{
              top: '100%',
              right: '0',
              marginTop: '8px',
              width: '280px',
              maxWidth: '90vw'
            }}
          >
            <div
              className="bg-gradient-to-br from-white to-gray-50 dark:from-[#0F2837] dark:to-[#1a3a4a] rounded-xl shadow-2xl border-2 p-4"
              style={{
                borderColor: annotation.color
              }}
            >
              <div className="mb-3">
                <h4
                  className="font-bold text-sm text-[#0F2837] dark:text-white mb-2 pb-1 inline-block"
                  style={{
                    borderBottom: `2px solid ${annotation.color}`
                  }}
                >
                  {annotation.selected_text}
                </h4>
              </div>
              <div
                className="rounded-lg p-3"
                style={{
                  backgroundColor: `${annotation.color}15`,
                  border: `1px solid ${annotation.color}30`
                }}
              >
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                  {annotation.annotation}
                </p>
              </div>
              {/* السهم */}
              <div
                className="absolute w-0 h-0"
                style={{
                  bottom: '100%',
                  right: '20px',
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: `8px solid ${annotation.color}`
                }}
              />
            </div>
          </span>
        </span>
      );

      lastIndex = annotation.end_position;
    });

    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  if (isLoading) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>{renderAnnotatedText()}</span>
  );
}
