import { MapPin } from 'lucide-react';

export const GlobalPresenceSection = () => {
  const locations = [
    { id: 1, top: '25%', left: '20%', name: 'أوروبا', color: 'from-blue-400 to-blue-600' },
    { id: 2, top: '35%', left: '15%', name: 'أفريقيا الشمالية', color: 'from-green-400 to-green-600' },
    { id: 3, top: '50%', left: '25%', name: 'أفريقيا', color: 'from-yellow-400 to-yellow-600' },
    { id: 4, top: '30%', left: '50%', name: 'الشرق الأوسط', color: 'from-orange-400 to-orange-600' },
    { id: 5, top: '45%', left: '55%', name: 'جنوب آسيا', color: 'from-purple-400 to-purple-600' },
    { id: 6, top: '25%', left: '75%', name: 'شرق آسيا', color: 'from-red-400 to-red-600' },
    { id: 7, top: '55%', left: '80%', name: 'أستراليا', color: 'from-cyan-400 to-cyan-600' },
    { id: 8, top: '40%', left: '85%', name: 'المحيط الهادئ', color: 'from-pink-400 to-pink-600' },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* خلفية منقطة */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* النص على اليمين (RTL) */}
          <div className="order-2 md:order-1">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-primary">تواجدنا العالمي</span>
            </h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              خبرة محلية، معايير عالمية
            </h2>
            <p className="text-lg text-muted-foreground">
              نخدم عملاءنا في جميع أنحاء العالم بأعلى معايير الجودة والاحترافية
            </p>
          </div>

          {/* الخريطة على اليسار (RTL) */}
          <div className="order-1 md:order-2 relative h-[650px]">
            {/* خريطة العالم بنقاط سداسية */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 1000 600" className="w-full h-full">
                {/* خلفية الخريطة بنمط سداسي */}
                <defs>
                  <pattern id="hexagons" width="20" height="17.32" patternUnits="userSpaceOnUse">
                    <polygon 
                      points="10,0 20,5 20,12.32 10,17.32 0,12.32 0,5" 
                      fill="none" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  </pattern>
                </defs>
                
                {/* شكل تقريبي للقارات */}
                <g fill="url(#hexagons)">
                  {/* أوروبا وآسيا */}
                  <ellipse cx="500" cy="200" rx="400" ry="150" opacity="0.6" />
                  {/* أفريقيا */}
                  <ellipse cx="450" cy="350" rx="180" ry="150" opacity="0.6" />
                  {/* أمريكا */}
                  <ellipse cx="200" cy="300" rx="120" ry="200" opacity="0.6" />
                  {/* أستراليا */}
                  <ellipse cx="800" cy="450" rx="100" ry="80" opacity="0.6" />
                </g>
              </svg>
            </div>

            {/* دبابيس المواقع */}
            {locations.map((location, index) => (
              <div
                key={location.id}
                className="absolute group cursor-pointer"
                style={{ 
                  top: location.top, 
                  left: location.left,
                  animation: `float 3s ease-in-out infinite ${index * 0.3}s`
                }}
              >
                {/* الدبوس */}
                <div className="relative">
                  <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-br ${location.color} p-1 rounded-full shadow-lg hover:scale-110 transition-transform`}>
                    <div className="relative w-12 h-12 rounded-full bg-white/90 flex items-center justify-center border-2 border-white">
                      <MapPin className="w-6 h-6" fill="currentColor" />
                    </div>
                  </div>
                  <MapPin className="w-8 h-8 text-primary drop-shadow-lg" fill="currentColor" />
                  
                  {/* اسم الموقع عند التمرير */}
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-background/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
                    {location.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </section>
  );
};
