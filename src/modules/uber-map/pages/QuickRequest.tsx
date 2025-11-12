import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, MapPin, Phone, Clock } from 'lucide-react';

export default function QuickRequest() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    serviceType: '',
    description: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setLocation('/');
    }, 2000);
  };

  const handleBack = () => {
    setLocation('/');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md p-8 text-center shadow-lg">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">تم بنجاح!</h1>
          <p className="text-gray-600 mb-2">
            شكراً لطلبك الخدمة
          </p>
          <p className="text-sm text-gray-500 mb-6">
            سيتواصل معك مزود الخدمة قريباً لتأكيد الموعد
          </p>
          <p className="text-xs text-gray-400">
            جاري إعادة التوجيه...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-0 h-auto"
          >
            <ArrowRight size={24} className="text-blue-600" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">اطلب الخدمة</h1>
        </div>

        {/* Main Form Card */}
        <Card className="p-8 shadow-lg mb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* عنوان الطلب */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  عنوان الطلب *
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="مثال: إصلاح تسرب الماء في المطبخ"
                  required
                  className="text-right"
                />
              </div>

              {/* اسم العميل */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  اسم العميل *
                </label>
                <Input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  required
                  className="text-right"
                />
              </div>

              {/* رقم الهاتف */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  رقم الهاتف *
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="01000000000"
                    required
                    className="text-right flex-1"
                  />
                  <Phone size={18} className="text-gray-400" />
                </div>
              </div>

              {/* العنوان */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  العنوان *
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="أدخل عنوانك الكامل"
                    required
                    className="text-right flex-1"
                  />
                  <MapPin size={18} className="text-gray-400" />
                </div>
              </div>

              {/* نوع الخدمة */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  نوع الخدمة *
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                >
                  <option value="">اختر نوع الخدمة</option>
                  <option value="plumber">سباك</option>
                  <option value="electrician">كهربائي</option>
                  <option value="carpenter">نجار</option>
                  <option value="painter">دهان</option>
                </select>
              </div>

              {/* الأولوية */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  الأولوية
                </label>
                <select
                  defaultValue="متوسطة"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                >
                  <option value="عاجلة">عاجلة</option>
                  <option value="متوسطة">متوسطة</option>
                  <option value="عادية">عادية</option>
                </select>
              </div>

              {/* التاريخ المفضل */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  التاريخ المفضل *
                </label>
                <Input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                />
              </div>

              {/* الوقت المفضل */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  الوقت المفضل *
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    required
                    className="text-right flex-1"
                  />
                  <Clock size={18} className="text-gray-400" />
                </div>
              </div>

              {/* وصف المشكلة */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  وصف المشكلة أو الخدمة المطلوبة *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="اشرح المشكلة بالتفصيل..."
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12"
              >
                إرسال الطلب
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Box */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-700 text-right">
            <strong>ملاحظة:</strong> سيتم التحقق من بيانات طلبك وسيتواصل معك مزود الخدمة خلال 24 ساعة لتأكيد الموعد والسعر.
          </p>
        </Card>
      </div>
    </div>
  );
}
