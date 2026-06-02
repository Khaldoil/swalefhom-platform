import { supabase } from './supabase';

// Test application data
const testApplication = {
  name: "محمد أحمد",
  email: "test@example.com",
  mobile: "0512345678",
  age: 25,
  city: "الرياض",
  education: "bachelors",
  motivation: "أرغب في المساهمة في حفظ تراثنا وتوثيق قصص أجدادنا للأجيال القادمة.",
  contribution: "يمكنني المساعدة في جمع وتوثيق القصص من كبار السن في منطقتي.",
  status: "pending"
};

// Submit test application
const submitApplication = async () => {
  try {
    const { data, error } = await supabase
      .from('ambassador_applications')
      .insert([testApplication])
      .select()
      .single();

    if (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
    
    console.log('Application submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

// Run the test
submitApplication()
  .then(console.log)
  .catch(console.error);