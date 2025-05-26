import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faSearch, 
  faUtensils, 
  faAppleWhole,
  faCarrot,
  faCheese,
  faDrumstickBite,
  faBreadSlice,
  faBowlFood,
  faSeedling,
  faCake,
  faTruckFast,
  faIceCream,
  faMugHot,
  faFish,
  faPlus,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { 
  Card, 
  Divider, 
  Button, 
  Chip,
  Searchbar,
  IconButton
} from '../utils/paperComponents';
import useFoodTracker from '../hooks/useFoodTracker';
import { 
  FoodData, 
  FoodCategory, 
  getAllFoods, 
  searchByName, 
  filterByCategory,
  getFrequentFoodsForMealType
} from '../data/foodDatabase';

type AddFoodScreenRouteProp = RouteProp<RootStackParamList, 'AddFood'>;

type AddFoodScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddFood'
>;

interface AddFoodScreenProps {
  route: AddFoodScreenRouteProp;
  navigation: AddFoodScreenNavigationProp;
}

// Kategori yapılandırması
interface CategoryConfig {
  type: FoodCategory;
  label: string;
  icon: any;
}

const AddFoodScreen: React.FC<AddFoodScreenProps> = ({ route, navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { mealType = 'breakfast' } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [foodResults, setFoodResults] = useState<FoodData[]>([]);
  const [customAmount, setCustomAmount] = useState('100');
  const [customAmountFoodId, setCustomAmountFoodId] = useState('');
  
  const { addFood } = useFoodTracker();

  // Kategoriler
  const categories: Array<CategoryConfig> = [
    { type: 'meyve', label: t('food.categories.fruit', 'Meyveler'), icon: faAppleWhole },
    { type: 'sebze', label: t('food.categories.vegetable', 'Sebzeler'), icon: faCarrot },
    { type: 'et', label: t('food.categories.meat', 'Et Ürünleri'), icon: faDrumstickBite },
    { type: 'tavuk', label: t('food.categories.chicken', 'Tavuk'), icon: faDrumstickBite },
    { type: 'balik', label: t('food.categories.fish', 'Balık'), icon: faFish },
    { type: 'sut_urunleri', label: t('food.categories.dairy', 'Süt Ürünleri'), icon: faCheese },
    { type: 'tahil', label: t('food.categories.grain', 'Tahıllar'), icon: faBreadSlice },
    { type: 'bakliyat', label: t('food.categories.legume', 'Bakliyat'), icon: faBowlFood },
    { type: 'kuruyemis', label: t('food.categories.nuts', 'Kuruyemiş'), icon: faSeedling },
    { type: 'tatli', label: t('food.categories.dessert', 'Tatlılar'), icon: faCake },
    { type: 'hazir_yemek', label: t('food.categories.readyMeal', 'Hazır Yemekler'), icon: faTruckFast },
    { type: 'atistirmalik', label: t('food.categories.snack', 'Atıştırmalıklar'), icon: faIceCream },
    { type: 'icecek', label: t('food.categories.beverage', 'İçecekler'), icon: faMugHot },
  ];

  // Component yüklendiğinde ve kategori veya arama değiştiğinde çalışır
  useEffect(() => {
    loadFoods();
  }, [searchQuery, selectedCategory]);

  // Başlangıç yüklenmesi
  useEffect(() => {
    // İlk yüklemede sık kullanılan besinleri göster
    const initialFoods = getFrequentFoodsForMealType(mealType);
    setFoodResults(initialFoods);
  }, [mealType]);

  // Yemekleri yükleme fonksiyonu
  const loadFoods = () => {
    try {
      if (selectedCategory) {
        // Kategori seçilmişse, kategori filtrele
        setFoodResults(filterByCategory(selectedCategory));
      } else if (searchQuery.trim() !== '') {
        // Arama yapılıyorsa, isme göre ara
        const results = searchByName(searchQuery);
        setFoodResults(results);
      } else {
        // Hiçbir filtreleme yoksa, öğün tipine göre sık kullanılanları göster
        setFoodResults(getFrequentFoodsForMealType(mealType));
      }
    } catch (error) {
      console.error("Yemekler yüklenirken hata:", error);
      setFoodResults([]);
    }
  };

  // Yemek ekleme fonksiyonu
  const handleAddFood = (food: FoodData) => {
    try {
      const amount = parseInt(customAmountFoodId === food.id ? customAmount : '100') || 100;

      if (amount <= 0 || amount > 10000) {
        alert(t('validAmountRange', 'Lütfen 1-10000 arasında bir miktar girin'));
        return;
      }

      // Oranı hesapla (100g üzerinden verilen değerleri istenilen miktara göre ayarla)
      const ratio = amount / (food.amount || 100);

      addFood({
        name: food.name,
        amount: amount,
        mealType: mealType,
        nutrition: {
          calories: Math.round((food.nutrition.calories || 0) * ratio),
          protein: parseFloat(((food.nutrition.protein || 0) * ratio).toFixed(1)),
          carbs: parseFloat(((food.nutrition.carbs || 0) * ratio).toFixed(1)),
          fat: parseFloat(((food.nutrition.fat || 0) * ratio).toFixed(1)),
          fiber: food.nutrition.fiber
            ? parseFloat((food.nutrition.fiber * ratio).toFixed(1))
            : undefined,
          sugar: food.nutrition.sugar
            ? parseFloat((food.nutrition.sugar * ratio).toFixed(1))
            : undefined,
        },
      });

      navigation.goBack();
    } catch (error) {
      console.error('Yemek eklenirken hata:', error);
      alert(t('errorAddingFood', 'Yemek eklenirken bir hata oluştu'));
    }
  };

  // Kategori ikonu getiren yardımcı fonksiyon
  const getCategoryIcon = (category: FoodCategory) => {
    const categoryConfig = categories.find(c => c.type === category);
    return categoryConfig?.icon || faUtensils;
  };

  // Mealtype türüne göre başlık
  const getMealTypeTitle = () => {
    switch (mealType) {
      case 'breakfast': return t('food.breakfast', 'Kahvaltı');
      case 'lunch': return t('food.lunch', 'Öğle Yemeği');
      case 'dinner': return t('food.dinner', 'Akşam Yemeği');
      case 'snack': return t('food.snacks', 'Atıştırmalık');
      default: return t('food.meal', 'Öğün');
    }
  };

  // Mealtype türüne göre renk
  const getMealTypeColor = () => {
    switch (mealType) {
      case 'breakfast': return theme.colors.primary;
      case 'lunch': return theme.colors.secondary;
      case 'dinner': return theme.colors.tertiary;
      case 'snack': return theme.colors.secondary;
      default: return theme.colors.primary;
    }
  };

  const mealTypeColor = getMealTypeColor();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Header Section - Modern and vibrant design with gradient */}
      <View 
        style={[
          styles.headerContainer, 
          { 
            backgroundColor: mealTypeColor,
            shadowColor: mealTypeColor,
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
              {t('food.addFood', 'Yeni Besin Ekle')}
            </Text>
            <Text style={[styles.headerTitle, { color: '#fff' }]}>
              {getMealTypeTitle()}
            </Text>
          </View>
        </View>

        {/* Search bar in header */}
        <View style={styles.searchContainer}>
          <View 
            style={[
              styles.searchBarWrapper, 
              { 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }
            ]}
          >
            <FontAwesomeIcon 
              icon={faSearch} 
              size={18} 
              color="rgba(255, 255, 255, 0.8)" 
              style={styles.searchIcon}
            />
            <TextInput
              placeholder={t('food.searchFood', 'Besin ara...')}
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: 'white' }]}
            />
          </View>
        </View>
      </View>

      {/* Categories horizontal scroll */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        <View style={styles.categoryButtonContainer}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              { 
                backgroundColor: selectedCategory === null 
                  ? `${mealTypeColor}20` 
                  : isDarkMode ? '#333340' : '#f0f0f0',
                borderColor: selectedCategory === null 
                  ? mealTypeColor 
                  : 'transparent'
              }
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryButtonText, 
              { 
                color: selectedCategory === null 
                  ? mealTypeColor 
                  : isDarkMode ? '#FFFFFF' : '#333333'
              }
            ]}>
              {t('all', 'Tümü')}
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity
              key={category.type}
              style={[
                styles.categoryButton,
                { 
                  backgroundColor: selectedCategory === category.type 
                    ? `${mealTypeColor}20` 
                    : isDarkMode ? '#333340' : '#f0f0f0',
                  borderColor: selectedCategory === category.type 
                    ? mealTypeColor 
                    : 'transparent'
                }
              ]}
              onPress={() => setSelectedCategory(category.type)}
            >
              <FontAwesomeIcon 
                icon={category.icon} 
                size={14} 
                color={selectedCategory === category.type ? mealTypeColor : isDarkMode ? '#CCCCCC' : '#666666'} 
                style={styles.categoryButtonIcon}
              />
              <Text style={[
                styles.categoryButtonText, 
                { 
                  color: selectedCategory === category.type 
                    ? mealTypeColor 
                    : isDarkMode ? '#FFFFFF' : '#333333'
                }
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Food items list */}
      <FlatList
        data={foodResults}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View 
              style={[
                styles.emptyIconContainer, 
                { backgroundColor: `${mealTypeColor}20` }
              ]}
            >
              <FontAwesomeIcon 
                icon={faUtensils} 
                size={40} 
                color={mealTypeColor} 
              />
            </View>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {searchQuery ? t('food.noResults', 'Arama sonucu bulunamadı') : t('foodListLoadError', 'Besin listesi yüklenemedi')}
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: mealTypeColor }]}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.emptyButtonText}>
                {searchQuery ? t('clearSearch', 'Aramayı Temizle') : t('tryAgain', 'Yeniden Dene')}
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <Card 
            style={[
              styles.foodCard, 
              { 
                backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
                borderRadius: 16,
                shadowColor: isDarkMode ? mealTypeColor : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 0,
              }
            ]}
          >
            <View style={styles.foodItem}>
              <View 
                style={[
                  styles.iconCircle, 
                  { 
                    backgroundColor: `${mealTypeColor}20`,
                    shadowColor: mealTypeColor,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 2
                  }
                ]}
              >
                <FontAwesomeIcon 
                  icon={getCategoryIcon(item.category)} 
                  size={22} 
                  color={mealTypeColor} 
                />
              </View>
              
              <View style={styles.foodInfo}>
                <Text style={[styles.foodName, { color: theme.colors.onSurface }]}>
                  {item.name}
                </Text>
                <Text style={[styles.foodCategory, { color: theme.colors.onSurfaceVariant }]}>
                  {item.category}
                </Text>
                <Text style={[styles.foodDetails, { color: theme.colors.onSurfaceVariant }]}>
                  {item.nutrition.calories} {t('food.calorieUnit', 'kcal')} / {item.amount}{item.unit || 'g'}
                </Text>
              </View>
              
              <View style={styles.foodActions}>
                <TextInput
                  style={[
                    styles.amountInput, 
                    { 
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      color: theme.colors.onSurface 
                    }
                  ]}
                  value={customAmountFoodId === item.id ? customAmount : '100'}
                  onChangeText={(text) => {
                    setCustomAmount(text);
                    setCustomAmountFoodId(item.id);
                  }}
                  keyboardType="numeric"
                  placeholder="100"
                />
                <Text style={[styles.unitText, { color: theme.colors.onSurfaceVariant }]}>
                  {item.unit || 'g'}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.addButton, 
                    { 
                      backgroundColor: mealTypeColor,
                      shadowColor: mealTypeColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3
                    }
                  ]}
                  onPress={() => handleAddFood(item)}
                >
                  <FontAwesomeIcon icon={faPlus} size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.cancelButton, 
            { 
              borderColor: mealTypeColor,
              backgroundColor: 'transparent' 
            }
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelButtonText, { color: mealTypeColor }]}>
            {t('cancel', 'İptal')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  searchContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  categoryScroll: {
    marginVertical: 16,
    maxHeight: 50,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    height: 36,
    minWidth: 80,
    justifyContent: 'center',
  },
  categoryButtonIcon: {
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  foodCard: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  foodItem: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  foodInfo: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 13,
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 14,
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    marginRight: 4,
  },
  unitText: {
    marginRight: 10,
    fontSize: 14,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default AddFoodScreen; 