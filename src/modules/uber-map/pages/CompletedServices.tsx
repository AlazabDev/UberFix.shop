import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, MessageCircle, ThumbsUp } from 'lucide-react';

interface CompletedService {
  id: string;
  serviceType: string;
  providerName: string;
  date: string;
  description: string;
  rating?: number;
  review?: string;
  price: number;
  duration: string;
}

const MOCK_COMPLETED: CompletedService[] = [
  {
    id: '1',
    serviceType: 'نجار',
    providerName: 'سامي محمود',
    date: '2025-11-03',
    description: 'إصلاح باب الخزانة',
    rating: 5,
    review: 'عمل احترافي جداً وسريع، شكراً لك',
    price: 300,
    duration: '2 ساعة'
  },
  {
    id: '2',
    serviceType: 'سباك',
    providerName: 'يوسف أحمد',
    date: '2025-10-28',
    description: 'إصلاح أنابيب المياه',
    rating: 4.5,
    review: 'خدمة جيدة جداً',
    price: 200,
    duration: '1.5 ساعة'
  },
  {
    id: '3',
    serviceType: 'دهان',
    providerName: 'علي محمد',
    date: '2025-10-20',
    description: 'دهان غرفة النوم',
    rating: 4,
    price: 500,
    duration: '4 ساعات'
  }
];

export default function CompletedServices() {
  const [, setLocation] = useLocation();
  const [selectedService, setSelectedService] = useState<CompletedService | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const handleBack = () => {
    setLocation('/');
  };

  const handleSubmitRating = () => {
    if (selectedService) {
      // Handle rating submission
      setShowRatingForm(false);
      setRating(5);
      setReview('');
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900">الخدمات المكتملة</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
            <p className="text-sm text-gray-600 mb-2">إجمالي الخدمات</p>
            <p className="text-3xl font-bold text-green-900">{MOCK_COMPLETED.length}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <p className="text-sm text-gray-600 mb-2">إجمالي الإنفاق</p>
            <p className="text-3xl font-bold text-blue-900">
              {MOCK_COMPLETED.reduce((sum, s) => sum + s.price, 0)} ج.م
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <p className="text-sm text-gray-600 mb-2">متوسط التقييم</p>
            <p className="text-3xl font-bold text-yellow-900">
              {(MOCK_COMPLETED.reduce((sum, s) => sum + (s.rating || 0), 0) / MOCK_COMPLETED.filter(s => s.rating).length).toFixed(1)}
            </p>
          </Card>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {MOCK_COMPLETED.map(service => (
            <Card key={service.id} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-right flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{service.description}</h3>
                  <p className="text-sm text-gray-600">
                    {service.serviceType} - {service.providerName}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  مكتمل
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">التاريخ</p>
                  <p className="font-semibold text-gray-900">{service.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">المدة</p>
                  <p className="font-semibold text-gray-900">{service.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">السعر</p>
                  <p className="font-semibold text-blue-600">{service.price} ج.م</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">التقييم</p>
                  {service.rating ? (
                    <div className="flex gap-1">
                      {getRatingStars(service.rating)}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">لم يتم التقييم</p>
                  )}
                </div>
              </div>

              {service.review && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2">تقييمك:</p>
                  <p className="text-gray-900">{service.review}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedService(service)}
                  className="flex-1"
                >
                  <MessageCircle size={16} className="mr-2" />
                  التفاصيل
                </Button>
                {!service.rating && (
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      setSelectedService(service);
                      setShowRatingForm(true);
                    }}
                  >
                    <Star size={16} className="mr-2" />
                    إضافة تقييم
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Rating Modal */}
        {selectedService && showRatingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">قيّم الخدمة</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRatingForm(false);
                    setSelectedService(null);
                  }}
                  className="p-0 h-auto"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">الخدمة: {selectedService.description}</p>
                  <p className="text-sm text-gray-600">المزود: {selectedService.providerName}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-3">التقييم</p>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        onClick={() => setRating(i)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">تعليقك</p>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="شارك رأيك في الخدمة..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRatingForm(false);
                    setSelectedService(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSubmitRating}
                >
                  <ThumbsUp size={16} className="mr-2" />
                  إرسال التقييم
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Detail Modal */}
        {selectedService && !showRatingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">تفاصيل الخدمة</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedService(null)}
                  className="p-0 h-auto"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">الخدمة</p>
                  <p className="font-semibold text-gray-900">{selectedService.description}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">المزود</p>
                  <p className="font-semibold text-gray-900">{selectedService.providerName}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">التاريخ والمدة</p>
                  <p className="font-semibold text-gray-900">
                    {selectedService.date} - {selectedService.duration}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">السعر</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedService.price} ج.م</p>
                </div>

                {selectedService.rating && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">تقييمك</p>
                    <div className="flex gap-1 mb-2">
                      {getRatingStars(selectedService.rating)}
                    </div>
                    {selectedService.review && (
                      <p className="text-sm text-gray-900">{selectedService.review}</p>
                    )}
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={() => setSelectedService(null)}
              >
                إغلاق
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
