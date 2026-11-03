'use client';

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
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

export default function CourseModal({ isOpen, onClose, onSave, initialData = null, isSaving = false }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        instructor: initialData.instructor || '',
        category: initialData.category || 'تطوير الويب',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        image: initialData.image || '',
        status: initialData.status || 'active',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [initialData, isOpen]);

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

        {/* Image URL */}
        <Input
          label="رابط صورة الكورس (اختياري)"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://example.com/course-image.jpg"
        />

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
