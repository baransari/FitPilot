import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../hooks/useTheme';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useTranslation } from 'react-i18next';
import { 
  faArrowLeft, 
  faUtensils, 
  faFire, 
  faWeight,
  faEgg,
  faBreadSlice,
  faOilCan,
  faAppleAlt,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { Button, Card, Divider, Chip } from '../utils/paperComponents';
import type { ExtendedMD3Theme } from '../types';
import useFoodTracker from '../hooks/useFoodTracker';
import { FoodData } from '../data/foodDatabase';

type FoodDetailsScreenRouteProp = RouteProp<RootStackParamList, 'FoodDetails'>;

type FoodDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FoodDetails'
>;

interface FoodDetailsScreenProps {
  route: FoodDetailsScreenRouteProp;
  navigation: FoodDetailsScreenNavigationProp;
}

const FoodDetailsScreen: React.FC<FoodDetailsScreenProps> = ({ route, navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { foodId } = route.params;
  const [food, setFood] = useState<FoodData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addFood } = useFoodTracker();
  const { t } = useTranslation();

  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        setLoading(true);
        // Dinamik olarak foodDatabase modülünü import etme
        const foodDatabaseModule = await import('../data/foodDatabase');
        // ID'ye göre seçilen yiyeceği bul
        const allFoods = foodDatabaseModule.getAllFoods();
        const foundFood = allFoods.find(item => item.id === foodId);
        
        if (foundFood) {
          setFood(foundFood);
        } else {
          console.error('Yiyecek bulunamadı, ID:', foodId);
        }
      } catch (error) {
        console.error('Yiyecek detayları yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFoodDetails();
  }, [foodId]);

  const handleAddFood = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (food) {
      // foodData nesnesini FoodEntry nesnesine dönüştürme
      addFood({
        name: food.name,
        amount: food.amount,
        mealType: mealType,
        nutrition: food.nutrition,
      });
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <Text style={{ color: theme.colors.onBackground }}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!food) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <Text style={{ color: theme.colors.onBackground, marginBottom: 16 }}>
            {t('foodNotFound')}
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={{ width: 200 }}
          >
            {t('goBack')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Header Section - Modern and vibrant design with gradient */}
      <View 
        style={[
          styles.headerContainer, 
          { 
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8
          }
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <FontAwesomeIcon 
              icon={faArrowLeft} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {t('nutritionInfo')}
            </Text>
            <Text style={[styles.headerTitle, { color: '#fff' }]}>
              {food.name}
            </Text>
          </View>
          <Chip
            icon={() => (
              <FontAwesomeIcon icon={faAppleAlt} size={14} color="#FFD54F" />
            )}
            style={[styles.categoryChip, { 
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.5)'
            }]}
          >
            {food.category}
          </Chip>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
      >
        {/* Food Info Card */}
        <Card 
          style={[
            styles.infoCard, 
            { 
              backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
              borderRadius: 24,
              shadowColor: isDarkMode ? theme.colors.primary : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
              marginTop: 16,
              overflow: 'hidden',
              borderWidth: 0
            }
          ]}
        >
          <View style={styles.foodIconContainer}>
            <View 
              style={[
                styles.iconCircle, 
                { 
                  backgroundColor: `${theme.colors.primary}20`,
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3
                }
              ]}
            >
              <FontAwesomeIcon 
                icon={faUtensils} 
                size={40} 
                color={theme.colors.primary} 
              />
            </View>
            <Text style={[styles.foodName, { color: theme.colors.onBackground }]}>
              {food.name}
            </Text>
            <Text style={[styles.foodCategory, { color: theme.colors.onSurfaceVariant }]}>
              {food.category}
            </Text>
            <Text style={[styles.portionInfo, { color: theme.colors.onSurfaceVariant }]}>
              {food.amount} {food.unit || 'g'} {t('food.portion', 'porsiyon')}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Nutrition Info Section */}
          <View style={styles.nutritionContainer}>
            <View style={styles.sectionTitleContainer}>
              <View style={{
                backgroundColor: `${theme.colors.secondary}20`,
                width: 40, 
                height: 40, 
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: theme.colors.secondary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}>
                <FontAwesomeIcon icon={faAppleAlt} size={20} color={theme.colors.secondary} />
              </View>
              <Text style={[styles.nutritionTitle, { color: theme.colors.onBackground }]}>
                {t('nutritionValues')}
              </Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <View style={[styles.nutritionIconContainer, { backgroundColor: `${theme.colors.error}20` }]}>
                <FontAwesomeIcon icon={faFire} size={18} color={theme.colors.error} />
              </View>
              <View style={styles.nutritionTextContainer}>
                <Text style={[styles.nutritionLabel, { color: theme.colors.onBackground }]}>
                  {t('calories.title', 'Kalori')}
                </Text>
                <Text style={[styles.nutritionValue, { color: theme.colors.onBackground }]}>
                  {food.nutrition.calories} {t('food.calorieUnit', 'kcal')}
                </Text>
              </View>
            </View>

            <View style={styles.nutritionItem}>
              <View style={[styles.nutritionIconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                <FontAwesomeIcon icon={faEgg} size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.nutritionTextContainer}>
                <Text style={[styles.nutritionLabel, { color: theme.colors.onBackground }]}>
                  {t('nutritionGoals.protein', 'Protein')}
                </Text>
                <Text style={[styles.nutritionValue, { color: theme.colors.onBackground }]}>
                  {food.nutrition.protein} g
                </Text>
              </View>
            </View>

            <View style={styles.nutritionItem}>
              <View style={[styles.nutritionIconContainer, { backgroundColor: `${theme.colors.secondary}20` }]}>
                <FontAwesomeIcon icon={faBreadSlice} size={18} color={theme.colors.secondary} />
              </View>
              <View style={styles.nutritionTextContainer}>
                <Text style={[styles.nutritionLabel, { color: theme.colors.onBackground }]}>
                  {t('nutritionGoals.carbs', 'Karbonhidrat')}
                </Text>
                <Text style={[styles.nutritionValue, { color: theme.colors.onBackground }]}>
                  {food.nutrition.carbs} g
                </Text>
              </View>
            </View>

            <View style={styles.nutritionItem}>
              <View style={[styles.nutritionIconContainer, { backgroundColor: `${theme.colors.tertiary}20` }]}>
                <FontAwesomeIcon icon={faOilCan} size={18} color={theme.colors.tertiary} />
              </View>
              <View style={styles.nutritionTextContainer}>
                <Text style={[styles.nutritionLabel, { color: theme.colors.onBackground }]}>
                  {t('nutritionGoals.fat', 'Yağ')}
                </Text>
                <Text style={[styles.nutritionValue, { color: theme.colors.onBackground }]}>
                  {food.nutrition.fat} g
                </Text>
              </View>
            </View>

            {food.nutrition.fiber !== undefined && (
              <View style={styles.nutritionItem}>
                <View style={[styles.nutritionIconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                  <FontAwesomeIcon icon={faWeight} size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.nutritionTextContainer}>
                  <Text style={[styles.nutritionLabel, { color: theme.colors.onBackground }]}>
                    {t('nutritionGoals.fiber', 'Lif')}
                  </Text>
                  <Text style={[styles.nutritionValue, { color: theme.colors.onBackground }]}>
                    {food.nutrition.fiber} g
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Add to Meal Card */}
        <Card 
          style={[
            styles.addMealCard, 
            { 
              backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
              borderRadius: 24,
              shadowColor: isDarkMode ? theme.colors.primary : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
              marginTop: 16,
              overflow: 'hidden',
              borderWidth: 0
            }
          ]}
        >
          <View style={styles.addMealSection}>
            <View style={styles.sectionTitleContainer}>
              <View style={{
                backgroundColor: `${theme.colors.primary}20`,
                width: 40, 
                height: 40, 
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}>
                <FontAwesomeIcon icon={faPlus} size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.addMealTitle, { color: theme.colors.onBackground }]}>
                {t('food.addToMeal', 'Öğüne Ekle')}
              </Text>
            </View>

            <Text style={[styles.addMealSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('food.whichMeal', 'Bu yiyeceği hangi öğüne eklemek istiyorsunuz?')}
            </Text>
            
            <View style={styles.mealButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.mealButton,
                  {
                    backgroundColor: theme.colors.primary,
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 5
                  }
                ]}
                onPress={() => handleAddFood('breakfast')}
              >
                <Text style={styles.mealButtonText}>{t('food.breakfast', 'Kahvaltı')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.mealButton,
                  {
                    backgroundColor: theme.colors.secondary,
                    shadowColor: theme.colors.secondary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 5
                  }
                ]}
                onPress={() => handleAddFood('lunch')}
              >
                <Text style={styles.mealButtonText}>{t('food.lunch', 'Öğle Yemeği')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.mealButton,
                  {
                    backgroundColor: theme.colors.tertiary,
                    shadowColor: theme.colors.tertiary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 5
                  }
                ]}
                onPress={() => handleAddFood('dinner')}
              >
                <Text style={styles.mealButtonText}>{t('food.dinner', 'Akşam Yemeği')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.mealButton,
                  {
                    backgroundColor: theme.colors.secondary,
                    shadowColor: theme.colors.secondary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 5
                  }
                ]}
                onPress={() => handleAddFood('snack')}
              >
                <Text style={styles.mealButtonText}>{t('food.snacks', 'Ara Öğün')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  categoryChip: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  scrollContent: {
    flex: 1,
  },
  infoCard: {
    overflow: 'hidden',
    padding: 16,
  },
  foodIconContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  foodCategory: {
    fontSize: 16,
    marginBottom: 8,
  },
  portionInfo: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
  },
  nutritionContainer: {
    paddingVertical: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, 
  },
  nutritionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  nutritionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  nutritionTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionLabel: {
    fontSize: 16,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addMealCard: {
    padding: 16,
    marginBottom: 16,
  },
  addMealSection: {
    paddingVertical: 8,
  },
  addMealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  addMealSubtitle: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  mealButtonsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  mealButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  mealButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FoodDetailsScreen; 