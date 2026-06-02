import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Trash2, Edit, Info, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

interface Annotation {
  id?: string;
  selected_text: string;
  annotation: string;
  start_position: number;
  end_position: number;
  color: string;
}

export default function StoryAnnotations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [story, setStory] = useState<any>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [annotationText, setAnnotationText] = useState('');
  const [annotationColor, setAnnotationColor] = useState('#FAC39B');
  const [isSaving, setIsSaving] = useState(false);

  const colors = [
    { name: 'برتقالي فاتح', value: '#FAC39B' },
    { name: 'أخضر مائي', value: '#91B9B4' },
    { name: 'أصفر', value: '#FFF59D' },
    { name: 'وردي', value: '#F8BBD0' },
    { name: 'أزرق فاتح', value: '#B3E5FC' },
    { name: 'أرجواني فاتح', value: '#E1BEE7' }
  ];

  useEffect(() => {
    loadStory();
    loadAnnotations();
  }, [id]);

  const loadStory = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setStory(data);
    } catch (error) {
      console.error('Error loading story:', error);
      addToast('حدث خطأ أثناء تحميل القصة', 'error');
    }
  };

  const loadAnnotations = async () => {
    try {
      const { data, error } = await supabase
        .from('story_annotations')
        .select('*')
        .eq('story_id', id)
        .order('start_position', { ascending: true });

      if (error) throw error;
      setAnnotations(data || []);
    } catch (error) {
      console.error('Error loading annotations:', error);
      addToast('حدث خطأ أثناء تحميل التفسيرات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') return;

    const selectedString = selection.toString().trim();
    const storyContent = story?.content || '';
    const startPosition = storyContent.indexOf(selectedString);

    if (startPosition === -1) {
      addToast('لم يتم العثور على النص المحدد', 'error');
      return;
    }

    setSelectedText(selectedString);
    setSelectedRange({
      start: startPosition,
      end: startPosition + selectedString.length
    });
    setAnnotationText('');
    setAnnotationColor('#FAC39B');
    setEditingAnnotation(null);
    setShowAddModal(true);
  };

  const handleSaveAnnotation = async () => {
    if (!annotationText.trim()) {
      addToast('يرجى إدخال التفسير', 'error');
      return;
    }

    if (!selectedRange) {
      addToast('لم يتم تحديد نص', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const annotationData = {
        story_id: id,
        selected_text: selectedText,
        annotation: annotationText.trim(),
        start_position: selectedRange.start,
        end_position: selectedRange.end,
        color: annotationColor,
        created_by: user?.id
      };

      if (editingAnnotation?.id) {
        const { error } = await supabase
          .from('story_annotations')
          .update(annotationData)
          .eq('id', editingAnnotation.id);

        if (error) throw error;
        addToast('تم تحديث التفسير بنجاح', 'success');
      } else {
        const { error } = await supabase
          .from('story_annotations')
          .insert([annotationData]);

        if (error) throw error;
        addToast('تم إضافة التفسير بنجاح', 'success');
      }

      setShowAddModal(false);
      loadAnnotations();
    } catch (error) {
      console.error('Error saving annotation:', error);
      addToast('حدث خطأ أثناء حفظ التفسير', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAnnotation = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setSelectedText(annotation.selected_text);
    setSelectedRange({
      start: annotation.start_position,
      end: annotation.end_position
    });
    setAnnotationText(annotation.annotation);
    setAnnotationColor(annotation.color);
    setShowAddModal(true);
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التفسير؟')) return;

    try {
      const { error } = await supabase
        .from('story_annotations')
        .delete()
        .eq('id', annotationId);

      if (error) throw error;
      addToast('تم حذف التفسير بنجاح', 'success');
      loadAnnotations();
    } catch (error) {
      console.error('Error deleting annotation:', error);
      addToast('حدث خطأ أثناء حذف التفسير', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/admin/stories')}
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          العودة للقصص
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          التفسيرات والتوضيحات
        </h1>
        <p className="text-gray-400">
          قصة: <span className="text-white">{story?.title}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-[#FAC39B]" />
            نص القصة
          </h2>
          <div className="bg-white/5 rounded-lg p-6 max-h-[600px] overflow-y-auto">
            <div
              className="text-white leading-relaxed whitespace-pre-wrap select-text cursor-text"
              onMouseUp={handleTextSelection}
            >
              {story?.content}
            </div>
            <div className="mt-4 p-4 bg-[#91B9B4]/10 rounded-lg border border-[#91B9B4]/20">
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Info className="w-4 h-4" />
                حدد أي نص من القصة لإضافة تفسير له
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              التفسيرات المضافة ({annotations.length})
            </h2>
          </div>

          {annotations.length === 0 ? (
            <div className="text-center py-12">
              <Info className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد تفسيرات بعد</p>
              <p className="text-gray-500 text-sm mt-2">
                حدد نصاً من القصة لإضافة تفسير
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#91B9B4]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span
                      className="font-bold text-white px-2 py-1 rounded"
                      style={{
                        background: `${annotation.color}40`,
                        borderBottom: `2px solid ${annotation.color}`
                      }}
                    >
                      {annotation.selected_text}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAnnotation(annotation)}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnotation(annotation.id!)}
                        className="p-1 hover:bg-red-500/10 rounded transition-colors text-gray-400 hover:text-red-400"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {annotation.annotation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title={editingAnnotation ? 'تعديل التفسير' : 'إضافة تفسير جديد'}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                النص المحدد
              </label>
              <div
                className="bg-white/5 border border-white/10 rounded-lg p-3 text-white font-bold"
                style={{
                  background: `${annotationColor}20`,
                  borderBottom: `2px solid ${annotationColor}`
                }}
              >
                {selectedText}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                التفسير / التوضيح
              </label>
              <textarea
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                placeholder="اكتب التفسير أو التوضيح هنا..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FAC39B] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                لون التمييز
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setAnnotationColor(color.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      annotationColor === color.value
                        ? 'border-white scale-105'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    style={{ backgroundColor: `${color.value}40` }}
                  >
                    <div
                      className="w-full h-3 rounded"
                      style={{ backgroundColor: color.value }}
                    />
                    <p className="text-xs text-white mt-2">{color.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveAnnotation}
                disabled={isSaving || !annotationText.trim()}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="mr-2">جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 ml-2" />
                    {editingAnnotation ? 'تحديث' : 'حفظ'}
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                disabled={isSaving}
                className="flex-1"
              >
                <X className="w-5 h-5 ml-2" />
                إلغاء
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
