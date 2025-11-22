import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HallOfExcellence as HallType } from "@/types/technician";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Award, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function HallOfExcellence() {
  const [achievements, setAchievements] = useState<HallType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("hall_of_excellence")
        .select(`
          *,
          technician:technicians(name, profile_image, specialization)
        `)
        .order("is_featured", { ascending: false })
        .order("achievement_date", { ascending: false });

      if (error) throw error;
      setAchievements(data as any || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "annual":
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case "monthly":
        return <Trophy className="w-8 h-8 text-yellow-600" />;
      case "legacy":
        return <Award className="w-8 h-8 text-purple-600" />;
      default:
        return <Star className="w-8 h-8 text-blue-600" />;
    }
  };

  const getAchievementBadge = (type: string) => {
    switch (type) {
      case "annual":
        return <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600">👑 بطل العام</Badge>;
      case "monthly":
        return <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600">🏆 فني الشهر</Badge>;
      case "legacy":
        return <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">⭐ Legacy</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            صفحة الشرف
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            تكريم أبطالنا الذين أثبتوا التميز والإخلاص في العمل
          </p>
        </div>

        {/* Featured Achievement */}
        {achievements.filter(a => a.is_featured).map((achievement) => (
          <Card key={achievement.id} className="mb-12 border-4 border-yellow-500 shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-yellow-500">
                    <AvatarImage src={achievement.technician?.profile_image} />
                    <AvatarFallback className="text-3xl bg-yellow-500 text-white">
                      {achievement.technician?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-3">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getAchievementBadge(achievement.achievement_type)}
                  </div>
                  <h2 className="text-4xl font-bold mb-2">{achievement.technician?.name}</h2>
                  <p className="text-xl text-muted-foreground mb-4">{achievement.achievement_title}</p>
                  <p className="text-lg">{achievement.achievement_description}</p>
                </div>
              </div>

              {achievement.story && (
                <div className="bg-background/50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-lg mb-3">قصة النجاح</h3>
                  <p className="text-muted-foreground leading-relaxed">{achievement.story}</p>
                </div>
              )}

              {achievement.media_urls && achievement.media_urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievement.media_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Achievement ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="mt-6 text-center text-sm text-muted-foreground">
                تم التكريم في {format(new Date(achievement.achievement_date), "MMMM yyyy", { locale: ar })}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* All Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.filter(a => !a.is_featured).map((achievement) => (
            <Card key={achievement.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full p-3">
                    {getAchievementIcon(achievement.achievement_type)}
                  </div>
                  <div className="flex-1">
                    {getAchievementBadge(achievement.achievement_type)}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12 border-2 border-primary">
                    <AvatarImage src={achievement.technician?.profile_image} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {achievement.technician?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold">{achievement.technician?.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.technician?.specialization}</p>
                  </div>
                </div>

                <h4 className="font-semibold mb-2">{achievement.achievement_title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{achievement.achievement_description}</p>

                <div className="text-xs text-muted-foreground">
                  {format(new Date(achievement.achievement_date), "MMMM yyyy", { locale: ar })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">لا توجد إنجازات حتى الآن</p>
          </div>
        )}
      </div>
    </div>
  );
}
