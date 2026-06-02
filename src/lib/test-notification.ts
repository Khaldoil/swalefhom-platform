import { createStory } from './supabase';

// Test story submission
const testStory = {
  title: "قصة اختبارية: ذكريات من الماضي",
  content: "هذه قصة اختبارية لفحص نظام الإشعارات",
  excerpt: "قصة اختبارية",
  region: "riyadh",
  date: "1950",
  category: "daily",
  story_type: "real",
  status: "draft",
  metadata: {
    teller_name: "محمد أحمد",
    teller_mobile: "0512345678",
    teller_email: "test@example.com",
    teller_age: "35",
    teller_city: "الرياض",
    story_source: "الجد",
    source_age: "85"
  }
};

// Submit test story
createStory(testStory)
  .then(() => console.log('Test story submitted successfully'))
  .catch(error => console.error('Error submitting test story:', error));