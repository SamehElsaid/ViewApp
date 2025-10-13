import { useEffect } from 'react';
import { useRouter } from 'next/router';

const ConfirmNavigation = ({ message, newData, editorValue }) => {
  const router = useRouter();
  const isDirty = JSON.stringify(newData) !== JSON.stringify(editorValue);

  useEffect(() => {
    // التعامل مع مغادرة الصفحة عبر أزرار المتصفح (كالرجوع أو إغلاق التب)
    const handleBeforeUnload = e => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message; // لبعض المتصفحات مثل Chrome

        return message;
      }
    };

    // التعامل مع تغييرات المسار داخل التطبيق (مثل النقر على رابط)
    const handleRouteChange = url => {
      if (!isDirty) return;
      if (!window.confirm(message)) {
        // إذا رفض المستخدم التأكيد، نقوم بإعادة التوجيه إلى نفس الصفحة
        // لن يتم رمي أي استثناء هنا مما يمنع ظهور الخطأ في الكونسول
        router.replace(router.asPath, undefined, { shallow: true });
        router.events.emit(
          'routeChangeError',
          new Error('تم إلغاء تغيير المسار'),
          url,
          false
        );

        return false;
      }

      return true;
    };

    // استخدام beforePopState للتعامل مع أزرار المتصفح (الرجوع/التقديم)
    router.beforePopState(() => {
      if (isDirty && !window.confirm(message)) {
        return false; // منع التنقل
      }

      return true;
    });

    window.addEventListener('beforeunload', handleBeforeUnload);
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.events.off('routeChangeStart', handleRouteChange);
      router.beforePopState(() => true);
    };
  }, [router, message, isDirty]);

  return null;
};

export default ConfirmNavigation;
