# دليل تعديل محرر TinyMCE

## 📝 كيفية التعديل على المحرر

### 1️⃣ إضافة API Key (اختياري لكن موصى به)

TinyMCE يحتاج إلى API Key مجاني للحصول على أفضل أداء:

1. اذهب إلى: https://www.tiny.cloud/
2. سجل حساب مجاني
3. احصل على API Key
4. في ملف `Editor.jsx`، ابحث عن:
   ```javascript
   // apiKey: 'your-api-key-here',
   ```
5. أزل التعليق وأضف المفتاح:
   ```javascript
   apiKey: 'your-api-key-here',
   ```

### 2️⃣ تعديل الارتفاع

في `tinyMCEConfig`:
```javascript
height: 400,  // غيّر القيمة حسب احتياجك
```

### 3️⃣ إضافة/إزالة إضافات (Plugins)

في `plugins` array:
```javascript
plugins: [
  'advlist',      // قوائم متقدمة
  'autolink',     // روابط تلقائية
  'lists',        // قوائم
  // أضف المزيد هنا...
]
```

**إضافات متاحة:**
- `table` - جداول
- `media` - فيديو وصوت
- `code` - عرض الكود
- `fullscreen` - ملء الشاشة
- `preview` - معاينة
- `searchreplace` - بحث واستبدال
- وغيرها الكثير...

### 4️⃣ تعديل شريط الأدوات (Toolbar)

في `toolbar`:
```javascript
toolbar: 'undo redo | blocks | ' +
  'bold italic underline strikethrough | forecolor backcolor | ' +
  'alignleft aligncenter alignright alignjustify | ' +
  'bullist numlist | outdent indent | ' +
  'removeformat | link image | code | help',
```

**الأزرار المتاحة:**
- `undo` / `redo` - تراجع/إعادة
- `bold` / `italic` / `underline` / `strikethrough` - تنسيق
- `forecolor` / `backcolor` - ألوان
- `alignleft` / `aligncenter` / `alignright` / `alignjustify` - محاذاة
- `bullist` / `numlist` - قوائم
- `link` / `image` - روابط وصور
- `code` - عرض الكود
- `help` - مساعدة

**مثال:** لإضافة زر الجداول:
```javascript
toolbar: '... | table | ...'
```

### 5️⃣ تعديل أنماط المحتوى

في `content_style`:
```javascript
content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; direction: rtl; }',
```

يمكنك تغيير:
- `font-family` - نوع الخط
- `font-size` - حجم الخط
- `direction` - الاتجاه (rtl/ltr)
- إضافة أي CSS آخر

### 6️⃣ إعدادات اللصق

للحفاظ على HTML/CSS عند اللصق:
```javascript
paste_data_images: true,           // السماح بلصق الصور
paste_as_text: false,              // عدم تحويل HTML إلى نص
paste_remove_styles: false,        // عدم إزالة الأنماط
paste_retain_style_properties: 'all', // الاحتفاظ بجميع الأنماط
```

### 7️⃣ إضافة أوامر مخصصة

في `setup` function:
```javascript
setup: (editor) => {
  editorRef.current = editor
  
  // مثال: إضافة زر مخصص
  editor.ui.registry.addButton('mybutton', {
    text: 'زر مخصص',
    onAction: () => {
      editor.insertContent('<p>نص مخصص</p>')
    }
  })
}
```

### 8️⃣ تغيير اللغة

```javascript
language: 'ar',  // ar, en, fr, etc.
```

### 9️⃣ إظهار/إخفاء عناصر

```javascript
menubar: false,    // إخفاء شريط القوائم
statusbar: true,   // إظهار شريط الحالة
branding: false,   // إخفاء شعار TinyMCE
promotion: false,  // إخفاء الإعلانات
```

## 📚 مصادر إضافية

- [وثائق TinyMCE](https://www.tiny.cloud/docs/)
- [قائمة الإضافات](https://www.tiny.cloud/docs/tinymce/6/plugins/)
- [خيارات الإعداد](https://www.tiny.cloud/docs/tinymce/6/editor-important-options/)

## ⚠️ ملاحظات مهمة

1. **API Key**: بدون API Key، TinyMCE سيعمل لكن مع قيود (مثل رسالة "Powered by TinyMCE")
2. **اللغة العربية**: تأكد من تحميل ملف اللغة العربية إذا لم يكن موجوداً
3. **الأداء**: استخدام API Key يحسن الأداء ويوفر تحديثات تلقائية
