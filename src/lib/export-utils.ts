export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const prepareStoriesForExport = (stories: any[]) => {
  return stories.map(story => ({
    'العنوان': story.title,
    'الراوي': story.storyteller_name,
    'المنطقة': story.region,
    'التصنيف': story.category,
    'الحالة': story.status === 'published' ? 'منشور' : 'مسودة',
    'تاريخ النشر': story.published_at ? new Date(story.published_at).toLocaleDateString('ar-SA') : '',
    'عدد المشاهدات': story.views_count || 0,
    'تاريخ الإنشاء': new Date(story.created_at).toLocaleDateString('ar-SA')
  }));
};

export const preparePioneersForExport = (pioneers: any[]) => {
  return pioneers.map(pioneer => ({
    'الاسم': pioneer.name,
    'التخصص': pioneer.specialty,
    'المنطقة': pioneer.region,
    'عدد الكتب': pioneer.books?.length || 0,
    'عدد الإنجازات': pioneer.achievements?.length || 0,
    'تاريخ الميلاد': pioneer.birth_year || '',
    'تاريخ الوفاة': pioneer.death_year || ''
  }));
};

export const prepareAmbassadorsForExport = (ambassadors: any[]) => {
  return ambassadors.map(ambassador => ({
    'الاسم': ambassador.full_name,
    'البريد الإلكتروني': ambassador.email,
    'رقم الجوال': ambassador.phone,
    'المنطقة': ambassador.region,
    'الحالة': ambassador.status === 'approved' ? 'معتمد' :
              ambassador.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة',
    'تاريخ التقديم': new Date(ambassador.created_at).toLocaleDateString('ar-SA')
  }));
};
