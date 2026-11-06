'use client';

import { useState, useRef } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { AlertCircle, Upload, Loader2 } from 'lucide-react';
import { uploadCourseImage } from '../../services/upload.service';

const EMPTY_FORM = {
  title: '',
  description: '',
  instructor: '',
  category: 'تطوير الويب',
  price: '',
  image: '',
  status: 'active',
};

export default function CourseModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isSaving = false,
  error = '',
}) {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        title: initialData.title || '',
        description: initialData.description || '',
        instructor: initialData.instructor || '',
        category: initialData.category || 'تطوير الويب',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        image: initialData.image || '',
        status: initialData.status || 'active',
      };
    }
    return EMPTY_FORM;
  });

  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      setUploadError('');
      const res = await uploadCourseImage(file);
      setFormData((prev) => ({ ...prev, image: res.data.data.url }));
    } catch (err) {
      setUploadError(err?.response?.data?.message || 'فشل رفع صورة الكورس');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title: formData.title.trim(),
      description: formData.description.trim(),
      instructor: formData.instructor.trim(),
      category: formData.category,
      price: Number(formData.price),
      image: formData.image.trim(),
      status: formData.status,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'تعديل بيانات الكورس' : 'إضافة كورس جديد'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
        {/* Error inside modal */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <Input
          label="عنوان الكورس"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="مثال: احتراف Next.js 15"
          required
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">وصف الكورس</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="اكتب وصفاً مختصراً للكورس..."
            className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
            rows={3}
            required
          />
        </div>

        {/* Instructor + Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="اسم المدرب"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            placeholder="م. أحمد السعيد"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">المجال التعليمي</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
              required
            >
              <option value="تطوير الويب">تطوير الويب</option>
              <option value="الذكاء الاصطناعي">الذكاء الاصطناعي</option>
              <option value="تصميم الواجهات">تصميم الواجهات</option>
              <option value="DevOps">DevOps &amp; السيرفرات</option>
              <option value="الأمن السيبراني">الأمن السيبراني</option>
            </select>
          </div>
        </div>

        {/* Price + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="سعر الكورس ($)"
            name="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={handleChange}
            placeholder="199"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">الحالة</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
            >
              <option value="active">نشط (Active)</option>
              <option value="draft">مسودة (Draft)</option>
            </select>
          </div>
        </div>

        {/* Image URL & File Upload */}
        <div className="flex flex-col gap-2">
          <Input
            label="رابط صورة الكورس (أو ارفع ملف من جهازك)"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/course-image.jpg"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              {uploadingImage ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>جارٍ رفع الصورة...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>رفع صورة من الجهاز</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            {uploadError && (
              <span className="text-xs text-red-500 font-semibold">{uploadError}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'جارٍ الحفظ...' : initialData ? 'حفظ التعديلات' : 'إضافة الكورس'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
