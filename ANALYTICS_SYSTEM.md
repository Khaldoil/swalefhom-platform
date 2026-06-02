# نظام الإحصائيات المتقدم - Advanced Analytics System

## نظرة عامة

تم تطوير نظام إحصائيات شامل ومتقدم يوفر تتبع دقيق لجميع التفاعلات مع المحتوى:
- **القراءات** (Stories, Blog)
- **الاستماع** (Audio Content)
- **المشاهدات** (Videos, Gallery)
- **التنزيلات**

---

## 📊 الميزات الرئيسية

### 1. التتبع في الوقت الفعلي (Real-time Tracking)
- ✅ الجلسات النشطة الآن
- ✅ المشاهدات خلال آخر 5 دقائق
- ✅ تحديث تلقائي كل دقيقة

### 2. إحصائيات شاملة ودقيقة
- ✅ إجمالي المشاهدات
- ✅ القراءات (عدد مرات قراءة المحتوى النصي)
- ✅ الاستماع (عدد مرات الاستماع للمحتوى الصوتي)
- ✅ المشاهدات المرئية (فيديوهات وصور)
- ✅ الزوار الفريدون (Unique Visitors)
- ✅ متوسط وقت التفاعل (Duration)

### 3. إحصائيات حسب نوع المحتوى
- القصص (stories)
- رواد التراث (pioneers)
- المعرض (gallery)
- المدونة (blog)
- التدريب (training)
- الفعاليات (events)

### 4. التحليلات المتقدمة
- ✅ المحتوى الأكثر مشاهدة (Top 10)
- ✅ معدل الإكمال (Completion Rate)
- ✅ الاتجاهات اليومية (Daily Trends)
- ✅ إحصائيات حسب الفترة (يومي، أسبوعي، شهري)

---

## 🗄️ هيكل قاعدة البيانات

### 1. جدول `content_views`
يتتبع كل مشاهدة/قراءة/استماع بشكل تفصيلي:

```sql
CREATE TABLE content_views (
  id uuid PRIMARY KEY,
  content_type text NOT NULL,      -- نوع المحتوى
  content_id uuid NOT NULL,         -- معرف المحتوى
  interaction_type text NOT NULL,   -- نوع التفاعل (view, read, listen, watch)
  user_id uuid,                     -- المستخدم (إن كان مسجلاً)
  session_id text NOT NULL,         -- معرف الجلسة
  duration_seconds integer,         -- الوقت المستغرق
  completed boolean,                -- هل أكمل المحتوى؟
  device_type text,                 -- نوع الجهاز (mobile, tablet, desktop)
  referrer text,                    -- من أين جاء الزائر
  ip_address inet,                  -- عنوان IP
  created_at timestamptz
);
```

**الفهارس للأداء:**
- `idx_content_views_content` - للبحث حسب نوع ومعرف المحتوى
- `idx_content_views_created_at` - للبحث حسب التاريخ
- `idx_content_views_user` - للبحث حسب المستخدم
- `idx_content_views_session` - للبحث حسب الجلسة

### 2. جدول `daily_stats`
إحصائيات يومية مجمعة (لتحسين الأداء):

```sql
CREATE TABLE daily_stats (
  id uuid PRIMARY KEY,
  date date NOT NULL,
  content_type text NOT NULL,
  content_id uuid,
  total_views integer DEFAULT 0,
  total_reads integer DEFAULT 0,
  total_listens integer DEFAULT 0,
  total_watches integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  avg_duration_seconds integer DEFAULT 0,
  completion_rate numeric(5,2) DEFAULT 0,
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE(date, content_type, content_id)
);
```

### 3. جدول `user_sessions`
تتبع جلسات المستخدمين:

```sql
CREATE TABLE user_sessions (
  id uuid PRIMARY KEY,
  session_id text UNIQUE NOT NULL,
  user_id uuid,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  pages_visited integer DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  device_type text,
  browser text,
  is_active boolean DEFAULT true
);
```

### 4. جدول `user_roles`
نظام الصلاحيات:

```sql
CREATE TABLE user_roles (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'moderator', 'user', 'ambassador')),
  granted_by uuid,
  granted_at timestamptz,
  UNIQUE(user_id, role)
);
```

---

## 🔧 الدوال المتاحة

### 1. `get_dashboard_stats(days_back integer)`
الحصول على جميع الإحصائيات للوحة التحكم:

```sql
SELECT get_dashboard_stats(30); -- آخر 30 يوم
```

**الناتج:**
```json
{
  "overview": {
    "total_views": 5420,
    "total_reads": 3200,
    "total_listens": 850,
    "total_watches": 1370,
    "unique_visitors": 2100,
    "avg_duration": 180
  },
  "by_content_type": {
    "story": {
      "views": 2500,
      "reads": 2300,
      "listens": 200,
      "watches": 0,
      "unique_visitors": 1200,
      "avg_duration": 240
    }
  },
  "daily_trend": [...],
  "top_content": [...],
  "real_time": {
    "active_sessions": 15,
    "recent_views": 48
  }
}
```

### 2. `track_content_view(...)`
تسجيل مشاهدة جديدة:

```sql
SELECT track_content_view(
  'story',                    -- نوع المحتوى
  'uuid-here',               -- معرف المحتوى
  'read',                    -- نوع التفاعل
  'session-id',              -- معرف الجلسة
  120,                       -- المدة بالثواني
  true                       -- هل أكمل؟
);
```

### 3. `get_content_stats(...)`
إحصائيات محتوى معين:

```sql
SELECT get_content_stats('story', 'uuid-here', 30);
```

### 4. `get_stats_by_period(...)`
إحصائيات حسب الفترة:

```sql
SELECT get_stats_by_period('day', 7);  -- آخر 7 أيام
SELECT get_stats_by_period('week', 4); -- آخر 4 أسابيع
SELECT get_stats_by_period('month', 6);-- آخر 6 أشهر
```

### 5. `update_daily_stats()`
تحديث الإحصائيات اليومية (يتم تشغيلها تلقائياً):

```sql
SELECT update_daily_stats();
```

---

## 💻 استخدام Frontend

### 1. Hook للتتبع التلقائي

```typescript
import { useContentTracking } from '../hooks/useAnalytics';

function StoryPage({ storyId }) {
  // تتبع تلقائي للقراءة مع الوقت المستغرق
  const { setIsCompleted } = useContentTracking('story', storyId, 'read');

  // عند الانتهاء من القراءة
  useEffect(() => {
    if (userFinishedReading) {
      setIsCompleted(true);
    }
  }, [userFinishedReading]);

  return <div>...</div>;
}
```

### 2. تتبع يدوي

```typescript
import { trackContentView } from '../hooks/useAnalytics';

// تتبع استماع
trackContentView('story', storyId, 'listen');

// تتبع مشاهدة فيديو
trackContentView('gallery', mediaId, 'watch');

// تتبع تنزيل
trackContentView('training', trainingId, 'download');
```

### 3. تتبع الجلسات

```typescript
import { useSession } from '../hooks/useAnalytics';

function App() {
  // تتبع تلقائي للجلسة
  useSession();

  return <div>...</div>;
}
```

---

## 📈 لوحة التحكم الجديدة

### الميزات:
1. **إحصائيات فورية**
   - تحديث كل دقيقة
   - جلسات نشطة الآن
   - مشاهدات آخر 5 دقائق

2. **فلاتر زمنية**
   - آخر 7 أيام
   - آخر 30 يوم
   - آخر 90 يوم
   - آخر سنة

3. **إحصائيات تفصيلية**
   - إجمالي المشاهدات
   - القراءات
   - الاستماع
   - المشاهدات المرئية
   - الزوار الفريدون
   - متوسط وقت التفاعل

4. **تحليلات متقدمة**
   - إحصائيات حسب نوع المحتوى
   - المحتوى الأكثر مشاهدة (Top 10)
   - معدل الإكمال
   - الاتجاه اليومي

5. **تصدير البيانات**
   - تصدير إلى CSV
   - جميع الإحصائيات

---

## 🔒 الأمان

### سياسات RLS:
- ✅ أي شخص يمكنه تسجيل مشاهدة (INSERT)
- ✅ الإداريون فقط يمكنهم مشاهدة الإحصائيات (SELECT)
- ✅ الإداريون فقط يمكنهم إدارة البيانات
- ✅ فحص الصلاحيات باستخدام `has_role()` و `has_any_role()`

---

## 🚀 الأداء

### التحسينات:
1. **الفهارس (Indexes)**
   - 10 فهارس على الجداول الرئيسية
   - تسريع البحث والاستعلامات

2. **الإحصائيات المجمعة**
   - جدول `daily_stats` للإحصائيات اليومية
   - تقليل الحمل على الاستعلامات

3. **التخزين المؤقت**
   - تحديث كل دقيقة في Frontend
   - عدم إرهاق قاعدة البيانات

---

## 📊 أمثلة الاستخدام

### مثال 1: تتبع قراءة قصة
```typescript
// في صفحة StoryDetails
useContentTracking('story', storyId, 'read');
```

### مثال 2: تتبع مشاهدة فيديو
```typescript
// في صفحة Gallery
useContentTracking('gallery', mediaId, 'watch');
```

### مثال 3: الحصول على إحصائيات
```typescript
const { data } = await supabase.rpc('get_dashboard_stats', {
  days_back: 30
});
```

---

## 🎯 الفوائد

### للإدارة:
- 📊 **قرارات مبنية على بيانات حقيقية**
- 📈 **فهم سلوك المستخدمين**
- 🎯 **تحديد المحتوى الأكثر نجاحاً**
- ⚡ **تحسين تجربة المستخدم**

### تقنياً:
- ✅ **أداء عالي** - فهارس محسنة
- ✅ **دقة عالية** - تتبع تفصيلي
- ✅ **مرونة** - سهولة التوسع
- ✅ **أمان** - RLS محكم

---

## 📝 ملاحظات مهمة

1. **الخصوصية**: يتم تخزين IP للأمان فقط، لا يتم مشاركته
2. **GDPR**: يمكن حذف بيانات مستخدم معين بسهولة
3. **الأداء**: الجداول محسنة بالفهارس
4. **الدقة**: تتبع كل تفاعل بشكل منفصل

---

## 🔄 الصيانة

### تحديث يومي تلقائي:
يمكن إعداد Cron Job لتحديث الإحصائيات اليومية:

```sql
-- في Supabase Dashboard > Database > Functions
-- أو باستخدام pg_cron
SELECT cron.schedule(
  'update-daily-stats',
  '0 1 * * *',  -- كل يوم الساعة 1 صباحاً
  $$SELECT update_daily_stats()$$
);
```

---

## 📧 الدعم

للمساعدة في:
- إضافة تتبع جديد
- تحسين الاستعلامات
- تقارير مخصصة
- دمج مع أدوات خارجية

**النظام الآن جاهز ويعمل بكفاءة عالية!** 🎉
