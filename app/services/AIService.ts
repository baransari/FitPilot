import axios from 'axios';

// Normalde güvenli bir şekilde .env dosyasında saklanmalıdır
// Burada örnek amaçlı kullanılmıştır
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface AIRequestOptions {
  userPrompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

interface AIResponse {
  text: string;
  success: boolean;
  error?: string;
}

export const AIService = {
  /**
   * OpenAI API'sini kullanarak sağlık tavsiyesi almanızı sağlar
   */
  getHealthAdvice: async (options: AIRequestOptions): Promise<AIResponse> => {
    const { userPrompt, systemPrompt, maxTokens = 500, temperature = 0.7 } = options;

    const defaultSystemPrompt =
      'Sen bir sağlık ve fitness asistanısın. Kullanıcının sağlık hedeflerine ulaşmasına yardımcı olmak için ' +
      'bilimsel kanıtlara dayalı tavsiyeler ver. Cevapların kısa, net ve anlaşılır olsun. ' +
      'Medikal teşhis veya tedavi önermemelisin. Yüksek risk içeren konularda, bir doktora danışılmasını öner.';

    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo', // veya daha gelişmiş bir model: gpt-4
          messages: [
            {
              role: 'system',
              content: systemPrompt || defaultSystemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          max_tokens: maxTokens,
          temperature: temperature,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        },
      );

      return {
        text: response.data.choices[0].message.content,
        success: true,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Sağlık verilerine göre kişiselleştirilmiş tavsiyeler üretir
   */
  getPersonalizedRecommendation: async (healthData: any): Promise<AIResponse> => {
    const {
      weight,
      height,
      age,
      gender,
      steps,
      sleepHours,
      caloriesConsumed,
      activityLevel,
      goal,
      recentWorkouts = [],
    } = healthData;

    // Sağlık verilerini string olarak formatlama
    const healthSummary = `
      Kullanıcı Bilgileri:
      - Yaş: ${age}
      - Cinsiyet: ${gender === 'male' ? 'Erkek' : 'Kadın'}
      - Boy: ${height} cm
      - Kilo: ${weight} kg
      - Günlük adım: ${steps}
      - Uyku süresi: ${sleepHours} saat
      - Tüketilen kalori: ${caloriesConsumed} kcal
      - Aktivite seviyesi: ${activityLevel}
      - Hedef: ${goal}
      - Son egzersizler: ${recentWorkouts.join(', ')}
    `;

    const userPrompt = `Bu sağlık verilerine göre bana kişiselleştirilmiş bir tavsiye ver: ${healthSummary}`;

    const systemPrompt =
      'Sen bir kişisel sağlık koçusun. Kullanıcının sağlık verilerini analiz et ve ' +
      'hedeflerine ulaşması için somut, uygulanabilir öneriler sun. Cevabın bilimsel olmalı ' +
      've kullanıcının mevcut durumuna özel olmalıdır. Tavsiyelerini 2-3 paragrafta sınırla.';

    return AIService.getHealthAdvice({
      userPrompt,
      systemPrompt,
      maxTokens: 600,
      temperature: 0.5, // Daha tutarlı yanıtlar için düşük sıcaklık
    });
  },

  /**
   * Kullanıcının beslenme günlüğünü analiz eder ve öneriler sunar
   */
  analyzeDiet: async (mealLog: any[]): Promise<AIResponse> => {
    // Yemek günlüğünü düzenli bir şekilde formatlama
    let formattedMeals = 'Beslenme Günlüğü:\n';

    mealLog.forEach(meal => {
      formattedMeals += `${meal.mealType} - ${meal.time}:\n`;
      meal.foods.forEach((food: any) => {
        formattedMeals += `- ${food.name}: ${food.portion}, ${food.calories} kcal, ${food.protein}g protein, ${food.carbs}g karbonhidrat, ${food.fat}g yağ\n`;
      });
      formattedMeals += '\n';
    });

    const userPrompt = `Bu beslenme günlüğümü analiz et ve beslenme alışkanlıklarımı iyileştirmek için öneriler sun: ${formattedMeals}`;

    return AIService.getHealthAdvice({
      userPrompt,
      temperature: 0.6,
    });
  },

  /**
   * Kullanıcının hedefine uygun egzersiz programı oluşturur
   */
  createExercisePlan: async (userData: any): Promise<AIResponse> => {
    const { fitnessLevel, goal, availableTime, preferredActivities, limitations } = userData;

    const userPrompt = `
      Benim için bir egzersiz programı oluştur:
      - Fitness seviyem: ${fitnessLevel}
      - Hedefim: ${goal}
      - Haftada ayırabileceğim süre: ${availableTime} saat
      - Tercih ettiğim aktiviteler: ${preferredActivities.join(', ')}
      - Sağlık kısıtlamalarım/sorunlarım: ${limitations || 'Yok'}
    `;

    return AIService.getHealthAdvice({
      userPrompt,
      maxTokens: 700,
    });
  },
};

export default AIService;
