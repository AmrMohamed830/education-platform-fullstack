'use client';

import { useState, useRef } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { AlertCircle, Upload, Loader2 } from 'lucide-react';
import { uploadCourseImage } from '../../services/upload.service';
import styles from './CourseModal.module.css';

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
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Error inside modal */}
        {error && (
          <div className={styles.modalError}>
            <AlertCircle size={18} />
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
        <div className={styles.textareaGroup}>
          <label className={styles.label}>وصف الكورس</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="اكتب وصفاً مختصراً للكورس..."
            className={styles.textarea}
            rows={3}
            required
          />
        </div>

        {/* Instructor + Category */}
        <div className={styles.row}>
          <Input
            label="اسم المدرب"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            placeholder="م. أحمد السعيد"
            required
          />

          <div className={styles.selectGroup}>
            <label className={styles.label}>المجال التعليمي</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.select}
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
        <div className={styles.row}>
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

          <div className={styles.selectGroup}>
            <label className={styles.label}>الحالة</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="active">نشط (Active)</option>
              <option value="draft">مسودة (Draft)</option>
            </select>
          </div>
        </div>

        {/* Image URL & File Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Input
            label="رابط صورة الكورس (أو ارفع ملف من جهازك)"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/course-image.jpg"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1.5px dashed #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#475569',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {uploadingImage ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
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
              <span style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 600 }}>
                {uploadError}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
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
