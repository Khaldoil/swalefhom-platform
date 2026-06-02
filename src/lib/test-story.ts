import { supabase } from './supabase';

// Test story data
const testStory = {
  title: "ذكريات من سوق القيصرية",
  content: "في خمسينيات القرن الماضي، كان سوق القيصرية في الأحساء مركزاً تجارياً مهماً. حدثني جدي عن تلك الأيام قائلاً: كنا نذهب إلى السوق باكراً، حيث رائحة البخور والعود تملأ المكان. كان التجار يعرضون بضائعهم بفخر، من الأقمشة الفاخرة إلى التوابل النادرة. وكان الناس يتبادلون الأخبار والقصص في المقاهي المحيطة بالسوق.",
  region: "eastern",
  date: "1950",
  category: "trade",
  story_type: "real",
  status: "draft",
  metadata: {
    teller_name: "محمد عبدالله",
    teller_mobile: "0512345678",
    teller_email: "test@example.com",
    teller_age: "35",
    teller_city: "الأحساء",
    story_source: "الجد",
    source_age: "85"
  }
};

// Submit test story
const submitStory = async () => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert(testStory)
      .select()
      .single();

    if (error) {
      console.error('Error submitting story:', error);
      throw error;
    }
    
    console.log('Story submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error submitting story:', error);
    throw error;
  }
};

// Export for testing
export { submitStory, testStory };