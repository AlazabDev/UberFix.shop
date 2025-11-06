import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function RegisterService() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    serviceType: ''
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
    if (step < 3) {
      setStep(step + 1);
    } else {
      setSubmitted(true);
      setTimeout(() => {
        setLocation('/');
      }, 3000);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setLocation('/');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md p-8 text-center shadow-lg">
          <div className="flex justify-center mb-6">
            <CheckCircle size={64} className="text-green-500" />
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">اطلب الخدمة</h1>
            <p className="text-sm text-gray-600">الخطوة {step} من 3</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i <= step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-lg mb-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    الاسم الكامل
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="أدخل اسمك الكامل"
                    required
                    className="text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    رقم الهاتف
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+20 100 000 0000"
                    required
                    className="text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    البريد الإلكتروني
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    required
                    className="text-right"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location & Description */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    نوع الخدمة
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
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    العنوان
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="أدخل عنوانك الكامل"
                    required
                    className="text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    وصف المشكلة أو الخدمة المطلوبة
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="اشرح المشكلة بالتفصيل..."
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Schedule */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    التاريخ المفضل
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
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    الوقت المفضل
                  </label>
                  <Input
                    type="time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    required
                    className="text-right"
                  />
                </div>

                {/* Summary */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-gray-900 mb-3">ملخص الطلب:</p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>الاسم:</strong> {formData.fullName}</p>
                    <p><strong>الهاتف:</strong> {formData.phone}</p>
                    <p><strong>نوع الخدمة:</strong> {formData.serviceType}</p>
                    <p><strong>الموقع:</strong> {formData.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                {step === 1 ? 'إلغاء' : 'السابق'}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {step === 3 ? 'تأكيد الطلب' : 'التالي'}
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
