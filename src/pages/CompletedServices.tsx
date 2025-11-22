import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<CompletedService | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSubmitRating = () => {
    if (selectedService) {
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
        className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-0 h-auto"
          >
            <ArrowRight size={24} className="text-primary" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">الخدمات المكتملة</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <p className="text-sm text-muted-foreground mb-2">إجمالي الخدمات</p>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100">{MOCK_COMPLETED.length}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <p className="text-sm text-muted-foreground mb-2">إجمالي الإنفاق</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {MOCK_COMPLETED.reduce((sum, s) => sum + s.price, 0)} ج.م
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
            <p className="text-sm text-muted-foreground mb-2">متوسط التقييم</p>
            <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
              {(MOCK_COMPLETED.reduce((sum, s) => sum + (s.rating || 0), 0) / MOCK_COMPLETED.filter(s => s.rating).length).toFixed(1)}
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          {MOCK_COMPLETED.map(service => (
            <Card key={service.id} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-right flex-1">
                  <h3 className="font-bold text-lg text-foreground">{service.description}</h3>
                  <p className="text-sm text-muted-foreground">
                    {service.serviceType} - {service.providerName}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  مكتمل
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">التاريخ</p>
                  <p className="font-semibold text-foreground">{service.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">المدة</p>
                  <p className="font-semibold text-foreground">{service.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">السعر</p>
                  <p className="font-semibold text-primary">{service.price} ج.م</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">التقييم</p>
                  {service.rating ? (
                    <div className="flex gap-1">
                      {getRatingStars(service.rating)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">لم يتم التقييم</p>
                  )}
                </div>
              </div>

              {service.review && (
                <div className="bg-accent p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground mb-2">تقييمك:</p>
                  <p className="text-foreground">{service.review}</p>
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
                    className="flex-1"
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

        {selectedService && showRatingForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">قيّم الخدمة</h2>
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
                  <p className="text-sm text-muted-foreground mb-2">الخدمة: {selectedService.description}</p>
                  <p className="text-sm text-muted-foreground">المزود: {selectedService.providerName}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">التقييم</p>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        onClick={() => setRating(i)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">تعليقك</p>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="شارك رأيك في الخدمة..."
                    rows={4}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-right resize-none"
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
                  className="flex-1"
                  onClick={handleSubmitRating}
                >
                  <ThumbsUp size={16} className="mr-2" />
                  إرسال التقييم
                </Button>
              </div>
            </Card>
          </div>
        )}

        {selectedService && !showRatingForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">تفاصيل الخدمة</h2>
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
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">الخدمة</p>
                  <p className="font-semibold text-foreground">{selectedService.description}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">المزود</p>
                  <p className="font-semibold text-foreground">{selectedService.providerName}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">التاريخ والمدة</p>
                  <p className="font-semibold text-foreground">
                    {selectedService.date} - {selectedService.duration}
                  </p>
                </div>

                <div className="bg-accent p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">السعر</p>
                  <p className="text-2xl font-bold text-primary">{selectedService.price} ج.م</p>
                </div>

                {selectedService.rating && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">تقييمك</p>
                    <div className="flex gap-1 mb-2">
                      {getRatingStars(selectedService.rating)}
                    </div>
                    {selectedService.review && (
                      <p className="text-sm text-foreground">{selectedService.review}</p>
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
