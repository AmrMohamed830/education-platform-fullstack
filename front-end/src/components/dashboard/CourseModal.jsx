'use client';

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import styles from './CourseModal.module.css';

export default function CourseModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    category: '',
    price: '',
    status: 'نشط',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        instructor: '',
        category: 'تطوير الويب',
        price: '199$',
        status: 'نشط',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'تعديل بيانات الكورس' : 'إضافة كورس جديد'}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="عنوان الكورس"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="مثال: احتراف Next.js 15"
          required
        />

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
            >
              <option value="تطوير الويب">تطوير الويب</option>
              <option value="الذكاء الاصطناعي">الذكاء الاصطناعي</option>
              <option value="تصميم الواجهات">تصميم الواجهات</option>
              <option value="DevOps">DevOps & السيرفرات</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <Input
            label="سعر الكورس ($)"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="199$"
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
              <option value="نشط">نشط (Active)</option>
              <option value="مسودة">مسودة (Draft)</option>
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? 'حفظ التعديلات' : 'إضافة الكورس'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
