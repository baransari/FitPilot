import { Nutrition } from '../store/foodTrackerSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Besin veritabanı tipi
export interface FoodData {
  id: string;
  name: string;
  category: FoodCategory;
  amount: number;
  unit: 'g' | 'ml' | 'adet'; // gram, mililitre, adet
  nutrition: Nutrition;
  imageUrl?: string;
  isCustom?: boolean; // Özel yemek kontrolü için
}

// Besin kategorileri
export type FoodCategory =
  | 'meyve'
  | 'sebze'
  | 'et'
  | 'balik'
  | 'tavuk'
  | 'sut_urunleri'
  | 'tahil'
  | 'kuruyemis'
  | 'bakliyat'
  | 'icecek'
  | 'tatli'
  | 'hazir_yemek'
  | 'atistirmalik';

// Bazı yaygın besinler için veritabanı
const foodDatabase: FoodData[] = [
  // Meyveler
  {
    id: '1',
    name: 'Elma',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10.4 },
  },
  {
    id: '2',
    name: 'Muz',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2 },
  },
  {
    id: '3',
    name: 'Portakal',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, sugar: 9.4 },
  },
  {
    id: '4',
    name: 'Çilek',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0, sugar: 4.9 },
  },
  {
    id: '5',
    name: 'Avokado',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7 },
  },

  // Sebzeler
  {
    id: '6',
    name: 'Brokoli',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6, sugar: 1.7 },
  },
  {
    id: '7',
    name: 'Havuç',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7 },
  },
  {
    id: '8',
    name: 'Domates',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  },
  {
    id: '9',
    name: 'Ispanak',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4 },
  },

  // Et ürünleri
  {
    id: '10',
    name: 'Dana Kıyma (Yağsız)',
    category: 'et',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0, sugar: 0 },
  },
  {
    id: '11',
    name: 'Dana Biftek',
    category: 'et',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 271, protein: 26, carbs: 0, fat: 19, fiber: 0, sugar: 0 },
  },
  {
    id: '12',
    name: 'Kuzu Pirzola',
    category: 'et',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, sugar: 0 },
  },

  // Tavuk ürünleri
  {
    id: '13',
    name: 'Tavuk Göğsü',
    category: 'tavuk',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
  },
  {
    id: '14',
    name: 'Tavuk But',
    category: 'tavuk',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 209, protein: 27, carbs: 0, fat: 11, fiber: 0, sugar: 0 },
  },

  // Balık ürünleri
  {
    id: '15',
    name: 'Somon',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0 },
  },
  {
    id: '16',
    name: 'Ton Balığı',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 184, protein: 30, carbs: 0, fat: 6, fiber: 0, sugar: 0 },
  },
  {
    id: '17',
    name: 'Hamsi',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 131, protein: 20, carbs: 0, fat: 4.8, fiber: 0, sugar: 0 },
  },

  // Süt ürünleri
  {
    id: '18',
    name: 'Süt (Tam Yağlı)',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.6, fiber: 0, sugar: 5.1 },
  },
  {
    id: '19',
    name: 'Yoğurt (Sade)',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sugar: 4.7 },
  },
  {
    id: '20',
    name: 'Beyaz Peynir',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 264, protein: 14, carbs: 3.5, fat: 21, fiber: 0, sugar: 0.5 },
  },
  {
    id: '21',
    name: 'Kaşar Peyniri',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 375, protein: 25, carbs: 2.1, fat: 30, fiber: 0, sugar: 0.5 },
  },

  // Tahıllar
  {
    id: '22',
    name: 'Ekmek (Beyaz)',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5 },
  },
  {
    id: '23',
    name: 'Pirinç (Pişmiş)',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1 },
  },
  {
    id: '24',
    name: 'Makarna (Pişmiş)',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 157, protein: 5.8, carbs: 30.9, fat: 0.9, fiber: 1.8, sugar: 0.6 },
  },
  {
    id: '25',
    name: 'Yulaf Ezmesi',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 0 },
  },
  {
    id: '26',
    name: 'Bulgur (Pişmiş)',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 83, protein: 3.1, carbs: 18.6, fat: 0.2, fiber: 4.5, sugar: 0.1 },
  },

  // Kuruyemişler
  {
    id: '27',
    name: 'Badem',
    category: 'kuruyemis',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 576, protein: 21, carbs: 22, fat: 49, fiber: 12.5, sugar: 4.4 },
  },
  {
    id: '28',
    name: 'Ceviz',
    category: 'kuruyemis',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, sugar: 2.6 },
  },
  {
    id: '29',
    name: 'Fındık',
    category: 'kuruyemis',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 628, protein: 15, carbs: 17, fat: 60, fiber: 9.7, sugar: 4.3 },
  },

  // Bakliyat
  {
    id: '30',
    name: 'Mercimek (Pişmiş)',
    category: 'bakliyat',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, sugar: 1.8 },
  },
  {
    id: '31',
    name: 'Nohut (Pişmiş)',
    category: 'bakliyat',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6, sugar: 4.8 },
  },
  {
    id: '32',
    name: 'Kuru Fasulye (Pişmiş)',
    category: 'bakliyat',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 7.4, sugar: 0.3 },
  },

  // İçecekler
  {
    id: '33',
    name: 'Portakal Suyu',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, fiber: 0.2, sugar: 8.3 },
  },
  {
    id: '34',
    name: 'Elma Suyu',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 46, protein: 0.1, carbs: 11.3, fat: 0.1, fiber: 0.1, sugar: 9.6 },
  },
  {
    id: '35',
    name: 'Ayran',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 42, protein: 2, carbs: 3, fat: 2, fiber: 0, sugar: 3 },
  },

  // Tatlılar
  {
    id: '36',
    name: 'Sütlaç',
    category: 'tatli',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 143, protein: 3.8, carbs: 30, fat: 1.7, fiber: 0.2, sugar: 19 },
  },
  {
    id: '37',
    name: 'Baklava',
    category: 'tatli',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 420, protein: 6.5, carbs: 52, fat: 21, fiber: 2.1, sugar: 32 },
  },
  {
    id: '38',
    name: 'Dondurma (Vanilyalı)',
    category: 'tatli',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0.5, sugar: 21 },
  },

  // Hazır yemekler
  {
    id: '39',
    name: 'Pizza (Margarita)',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.2, sugar: 3.6 },
  },
  {
    id: '40',
    name: 'Hamburger',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 295, protein: 13, carbs: 30, fat: 14, fiber: 1.3, sugar: 4.5 },
  },

  // Atıştırmalıklar
  {
    id: '41',
    name: 'Patates Cipsi',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 536, protein: 7, carbs: 53, fat: 35, fiber: 4.8, sugar: 0.3 },
  },
  {
    id: '42',
    name: 'Çikolata (Sütlü)',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 535, protein: 7.7, carbs: 59, fat: 30, fiber: 3.4, sugar: 52 },
  },

  // Daha fazla meyve
  {
    id: '43',
    name: 'Armut',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 57, protein: 0.4, carbs: 15.2, fat: 0.1, fiber: 3.1, sugar: 9.8 },
  },
  {
    id: '44',
    name: 'Kayısı',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 48, protein: 1.4, carbs: 11.1, fat: 0.4, fiber: 2.0, sugar: 9.2 },
  },
  {
    id: '45',
    name: 'Kiraz',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 63, protein: 1.1, carbs: 16.0, fat: 0.2, fiber: 2.1, sugar: 12.8 },
  },
  {
    id: '46',
    name: 'Kivi',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, fiber: 3.0, sugar: 9.0 },
  },
  {
    id: '47',
    name: 'Karpuz',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, sugar: 6.2 },
  },
  {
    id: '48',
    name: 'Kavun',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 0.9, sugar: 7.9 },
  },
  {
    id: '49',
    name: 'Üzüm',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fiber: 0.9, sugar: 15.5 },
  },
  {
    id: '50',
    name: 'Nar',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4.0, sugar: 13.7 },
  },
  {
    id: '51',
    name: 'Ananas',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, sugar: 10.0 },
  },
  {
    id: '52',
    name: 'Greyfurt',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 42, protein: 0.8, carbs: 10.7, fat: 0.1, fiber: 1.6, sugar: 7.0 },
  },

  // Daha fazla sebze
  {
    id: '53',
    name: 'Patlıcan',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 25, protein: 1.0, carbs: 6.0, fat: 0.2, fiber: 3.0, sugar: 3.2 },
  },
  {
    id: '54',
    name: 'Kabak',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1.0, sugar: 2.5 },
  },
  {
    id: '55',
    name: 'Biber (Kırmızı)',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 31, protein: 1.0, carbs: 7.2, fat: 0.3, fiber: 2.1, sugar: 4.2 },
  },
  {
    id: '56',
    name: 'Biber (Yeşil)',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.7, sugar: 2.4 },
  },
  {
    id: '57',
    name: 'Marul',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8 },
  },
  {
    id: '58',
    name: 'Lahana',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5, sugar: 3.2 },
  },
  {
    id: '59',
    name: 'Karnıbahar',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 25, protein: 1.9, carbs: 4.9, fat: 0.3, fiber: 2.0, sugar: 1.9 },
  },
  {
    id: '60',
    name: 'Kereviz',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 16, protein: 0.7, carbs: 3.5, fat: 0.2, fiber: 1.6, sugar: 1.8 },
  },

  // Daha fazla et ürünü
  {
    id: '61',
    name: 'Dana Antrikot',
    category: 'et',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 267, protein: 26.2, carbs: 0, fat: 17.5, fiber: 0, sugar: 0 },
  },
  {
    id: '62',
    name: 'Dana Bonfile',
    category: 'et',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 217, protein: 26.4, carbs: 0, fat: 12.7, fiber: 0, sugar: 0 },
  },
  {
    id: '63',
    name: 'Kuzu Eti',
    category: 'et',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 282, protein: 24.5, carbs: 0, fat: 20.3, fiber: 0, sugar: 0 },
  },
  {
    id: '64',
    name: 'Dana Ciğer',
    category: 'et',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 135, protein: 20.4, carbs: 3.9, fat: 3.6, fiber: 0, sugar: 0 },
  },

  // Daha fazla tavuk ürünü
  {
    id: '65',
    name: 'Tavuk Kanat',
    category: 'tavuk',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 266, protein: 23.8, carbs: 0, fat: 19.3, fiber: 0, sugar: 0 },
  },
  {
    id: '66',
    name: 'Hindi Göğsü',
    category: 'tavuk',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 157, protein: 24, carbs: 0, fat: 7, fiber: 0, sugar: 0 },
  },
  {
    id: '67',
    name: 'Tavuk Ciğer',
    category: 'tavuk',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 172, protein: 26.5, carbs: 1, fat: 6.5, fiber: 0, sugar: 0 },
  },

  // Daha fazla balık ürünü
  {
    id: '68',
    name: 'Levrek',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 124, protein: 23.6, carbs: 0, fat: 2.6, fiber: 0, sugar: 0 },
  },
  {
    id: '69',
    name: 'Çipura',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 118, protein: 20.5, carbs: 0, fat: 3.7, fiber: 0, sugar: 0 },
  },
  {
    id: '70',
    name: 'Mezgit',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 90, protein: 18.8, carbs: 0, fat: 1.3, fiber: 0, sugar: 0 },
  },
  {
    id: '71',
    name: 'Alabalık',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 141, protein: 20.8, carbs: 0, fat: 6.1, fiber: 0, sugar: 0 },
  },
  {
    id: '72',
    name: 'Kalamar',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 92, protein: 15.6, carbs: 3.1, fat: 1.4, fiber: 0, sugar: 0 },
  },
  {
    id: '73',
    name: 'Karides',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, sugar: 0 },
  },

  // Daha fazla süt ürünü
  {
    id: '74',
    name: 'Süt (Yarım Yağlı)',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 42, protein: 3.3, carbs: 5, fat: 1.5, fiber: 0, sugar: 5 },
  },
  {
    id: '75',
    name: 'Süt (Yağsız)',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, sugar: 5 },
  },
  {
    id: '76',
    name: 'Kefir',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 55, protein: 3.3, carbs: 4.3, fat: 2.5, fiber: 0, sugar: 4.3 },
  },
  {
    id: '77',
    name: 'Lor Peyniri',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 0.3 },
  },
  {
    id: '78',
    name: 'Labne',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 184, protein: 5.7, carbs: 2.6, fat: 17, fiber: 0, sugar: 2.6 },
  },
  {
    id: '79',
    name: 'Hellim Peyniri',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 321, protein: 22.1, carbs: 2.4, fat: 25.1, fiber: 0, sugar: 0.4 },
  },

  // Daha fazla tahıl
  {
    id: '80',
    name: 'Ekmek (Tam Buğday)',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 247, protein: 13, carbs: 42, fat: 3.4, fiber: 7.0, sugar: 5.0 },
  },
  {
    id: '81',
    name: 'Ekmek (Çavdar)',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 259, protein: 8.5, carbs: 48, fat: 3.3, fiber: 5.8, sugar: 3.9 },
  },
  {
    id: '82',
    name: 'Kinoa',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 368, protein: 14, carbs: 64, fat: 6.1, fiber: 7.0, sugar: 2.8 },
  },
  {
    id: '83',
    name: 'Kahverengi Pirinç',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4 },
  },

  // Daha fazla tahıl ve ekmek ürünleri
  {
    id: '84',
    name: 'Mısır (Pişmiş)',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 86, protein: 3.2, carbs: 19, fat: 1.2, fiber: 2.4, sugar: 3.2 },
  },
  {
    id: '85',
    name: 'Tortilla (Mısır)',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 237, protein: 5.7, carbs: 49.1, fat: 2.5, fiber: 5.4, sugar: 0.5 },
  },
  {
    id: '86',
    name: 'Lavaş',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 275, protein: 9.1, carbs: 56.8, fat: 1.3, fiber: 2.3, sugar: 1.1 },
  },
  {
    id: '87',
    name: 'Pide',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 252, protein: 9.5, carbs: 50.1, fat: 1.6, fiber: 2.0, sugar: 1.7 },
  },
  {
    id: '88',
    name: 'Simit',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 332, protein: 10.2, carbs: 64.1, fat: 4.5, fiber: 2.8, sugar: 2.2 },
  },

  // Daha fazla kuruyemiş
  {
    id: '89',
    name: 'Antep Fıstığı',
    category: 'kuruyemis',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 560, protein: 20.2, carbs: 28.0, fat: 45.3, fiber: 10.6, sugar: 7.7 },
  },
  {
    id: '90',
    name: 'Kaju',
    category: 'kuruyemis',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 553, protein: 18.2, carbs: 30.2, fat: 43.8, fiber: 3.3, sugar: 5.9 },
  },
  {
    id: '91',
    name: 'Yer Fıstığı',
    category: 'kuruyemis',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5, sugar: 4.7 },
  },
  {
    id: '92',
    name: 'Kuru Üzüm',
    category: 'kuruyemis',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 299, protein: 3.1, carbs: 79.2, fat: 0.5, fiber: 3.7, sugar: 59.2 },
  },
  {
    id: '93',
    name: 'Kuru Kayısı',
    category: 'kuruyemis',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 241, protein: 3.4, carbs: 62.6, fat: 0.5, fiber: 7.3, sugar: 53.4 },
  },
  {
    id: '94',
    name: 'Kuru İncir',
    category: 'kuruyemis',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 249, protein: 3.3, carbs: 63.9, fat: 0.9, fiber: 9.8, sugar: 47.9 },
  },

  // Daha fazla bakliyat
  {
    id: '95',
    name: 'Barbunya (Pişmiş)',
    category: 'bakliyat',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 115, protein: 7.7, carbs: 20.2, fat: 0.5, fiber: 7.0, sugar: 0.5 },
  },
  {
    id: '96',
    name: 'Börülce (Pişmiş)',
    category: 'bakliyat',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 116, protein: 7.8, carbs: 20.8, fat: 0.6, fiber: 6.5, sugar: 0.8 },
  },
  {
    id: '97',
    name: 'Bakla (Pişmiş)',
    category: 'bakliyat',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 110, protein: 7.6, carbs: 19.7, fat: 0.4, fiber: 5.4, sugar: 1.8 },
  },
  {
    id: '98',
    name: 'Soya Fasulyesi (Pişmiş)',
    category: 'bakliyat',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 141, protein: 12.4, carbs: 11.1, fat: 6.4, fiber: 6.0, sugar: 3.0 },
  },

  // Daha fazla içecek
  {
    id: '99',
    name: 'Çay',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 1, protein: 0, carbs: 0.2, fat: 0, fiber: 0, sugar: 0 },
  },
  {
    id: '100',
    name: 'Kahve (Sade)',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 2, protein: 0.1, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
  },
  {
    id: '101',
    name: 'Limonata',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 42, protein: 0.1, carbs: 10.6, fat: 0.1, fiber: 0.1, sugar: 9.8 },
  },
  {
    id: '102',
    name: 'Domates Suyu',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 17, protein: 0.8, carbs: 3.3, fat: 0.2, fiber: 0.5, sugar: 2.6 },
  },
  {
    id: '103',
    name: 'Bitki Çayı',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 2, protein: 0, carbs: 0.5, fat: 0, fiber: 0, sugar: 0 },
  },
  {
    id: '104',
    name: 'Soğuk Çay',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 30, protein: 0, carbs: 7.5, fat: 0, fiber: 0, sugar: 7.5 },
  },
  {
    id: '105',
    name: 'Gazoz',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 41, protein: 0, carbs: 10.6, fat: 0, fiber: 0, sugar: 10.6 },
  },
  {
    id: '106',
    name: 'Kola',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 42, protein: 0, carbs: 10.8, fat: 0, fiber: 0, sugar: 10.8 },
  },
  {
    id: '107',
    name: 'Maden Suyu',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
  },

  // Daha fazla tatlı
  {
    id: '108',
    name: 'Künefe',
    category: 'tatli',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 426, protein: 8.2, carbs: 49.3, fat: 23.1, fiber: 0.8, sugar: 32.4 },
  },
  {
    id: '109',
    name: 'Kadayıf',
    category: 'tatli',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 395, protein: 5.8, carbs: 55.7, fat: 17.2, fiber: 2.1, sugar: 36.4 },
  },
  {
    id: '110',
    name: 'Revani',
    category: 'tatli',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 372, protein: 5.4, carbs: 63.8, fat: 11.5, fiber: 0.6, sugar: 42.7 },
  },
  {
    id: '111',
    name: 'Lokum',
    category: 'tatli',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 329, protein: 0.1, carbs: 82.2, fat: 0.1, fiber: 0, sugar: 75.2 },
  },
  {
    id: '112',
    name: 'Helva',
    category: 'tatli',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 516, protein: 10.5, carbs: 60.8, fat: 25.5, fiber: 2.0, sugar: 41.3 },
  },
  {
    id: '113',
    name: 'Aşure',
    category: 'tatli',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 185, protein: 3.6, carbs: 40.2, fat: 1.8, fiber: 2.2, sugar: 25.6 },
  },

  // Daha fazla hazır yemek
  {
    id: '114',
    name: 'Lahmacun',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 212, protein: 9.5, carbs: 32.3, fat: 5.7, fiber: 2.0, sugar: 1.7 },
  },
  {
    id: '115',
    name: 'Pide (Kıymalı)',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 232, protein: 11.8, carbs: 35.7, fat: 6.1, fiber: 1.8, sugar: 1.4 },
  },
  {
    id: '116',
    name: 'Mantı',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 217, protein: 9.8, carbs: 33.4, fat: 5.9, fiber: 1.2, sugar: 1.1 },
  },
  {
    id: '117',
    name: 'İçli Köfte',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 250, protein: 8.7, carbs: 28.9, fat: 12.5, fiber: 2.3, sugar: 1.2 },
  },
  {
    id: '118',
    name: 'Döner',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 237, protein: 19.5, carbs: 12.2, fat: 13.5, fiber: 0.7, sugar: 0.5 },
  },
  {
    id: '119',
    name: 'Kebap',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 267, protein: 21.2, carbs: 8.3, fat: 17.4, fiber: 0.5, sugar: 0.8 },
  },
  {
    id: '120',
    name: 'Kumpir',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 189, protein: 4.3, carbs: 25.6, fat: 8.2, fiber: 2.4, sugar: 1.6 },
  },

  // Daha fazla atıştırmalık
  {
    id: '121',
    name: 'Kraker',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 460, protein: 10, carbs: 75.8, fat: 12.7, fiber: 3.2, sugar: 3.1 },
  },
  {
    id: '122',
    name: 'Bisküvi (Sade)',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 443, protein: 7.3, carbs: 72.5, fat: 14.1, fiber: 2.4, sugar: 18.3 },
  },
  {
    id: '123',
    name: 'Mısır Cipsi',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 525, protein: 7.5, carbs: 62.8, fat: 27.9, fiber: 4.5, sugar: 0.8 },
  },
  {
    id: '124',
    name: 'Çikolatalı Gofret',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 538, protein: 6.9, carbs: 58.2, fat: 31.5, fiber: 2.0, sugar: 38.4 },
  },
  {
    id: '125',
    name: 'Popcorn',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 387, protein: 12.3, carbs: 77.5, fat: 4.5, fiber: 14.5, sugar: 0.8 },
  },
  {
    id: '126',
    name: 'Çubuk Kraker',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 427, protein: 10.2, carbs: 74.8, fat: 10.1, fiber: 2.5, sugar: 1.7 },
  },

  // Daha fazla sebze
  {
    id: '127',
    name: 'Turp',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 16, protein: 0.7, carbs: 3.4, fat: 0.1, fiber: 1.6, sugar: 1.9 },
  },
  {
    id: '128',
    name: 'Pancar',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 43, protein: 1.6, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 6.8 },
  },
  {
    id: '129',
    name: 'Sarımsak',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1, sugar: 1.0 },
  },
  {
    id: '130',
    name: 'Taze Fasulye',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 31, protein: 1.8, carbs: 7.0, fat: 0.1, fiber: 2.7, sugar: 3.3 },
  },
  {
    id: '131',
    name: 'Bezelye (Taze)',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 81, protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.1, sugar: 5.7 },
  },
  {
    id: '132',
    name: 'Enginar',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 47, protein: 3.3, carbs: 10.5, fat: 0.2, fiber: 5.4, sugar: 0.9 },
  },
  {
    id: '133',
    name: 'Kuşkonmaz',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1, sugar: 1.9 },
  },
  {
    id: '134',
    name: 'Mantar',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1.0, sugar: 1.2 },
  },
  {
    id: '135',
    name: 'Bamya',
    category: 'sebze',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 33, protein: 1.9, carbs: 7.5, fat: 0.2, fiber: 3.2, sugar: 1.5 },
  },

  // Daha fazla balık/deniz ürünü
  {
    id: '136',
    name: 'Midye',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 86, protein: 11.9, carbs: 3.4, fat: 2.3, fiber: 0, sugar: 0 },
  },
  {
    id: '137',
    name: 'Ahtapot',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 82, protein: 15.4, carbs: 2.2, fat: 1.0, fiber: 0, sugar: 0 },
  },
  {
    id: '138',
    name: 'Yengeç',
    category: 'balik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 83, protein: 17.2, carbs: 0, fat: 1.5, fiber: 0, sugar: 0 },
  },

  // Egzotik meyveler
  {
    id: '139',
    name: 'Mango',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 13.7 },
  },
  {
    id: '140',
    name: 'Papaya',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3, fiber: 1.7, sugar: 7.8 },
  },
  {
    id: '141',
    name: 'Pitaya (Ejder Meyvesi)',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 60, protein: 1.2, carbs: 13, fat: 0.4, fiber: 3, sugar: 9 },
  },
  {
    id: '142',
    name: 'Kivi (Altın)',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 63, protein: 1.0, carbs: 15.8, fat: 0.3, fiber: 2.1, sugar: 12.3 },
  },
  {
    id: '143',
    name: 'Passion Fruit',
    category: 'meyve',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 97, protein: 2.2, carbs: 23.4, fat: 0.7, fiber: 10.4, sugar: 11.2 },
  },

  // Glutensiz ürünler
  {
    id: '144',
    name: 'Pirinç Ekmeği',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 265, protein: 4.5, carbs: 56.3, fat: 2.1, fiber: 2.4, sugar: 3.3 },
  },
  {
    id: '145',
    name: 'Mısır Ekmeği',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 198, protein: 4.3, carbs: 36.7, fat: 3.8, fiber: 2.2, sugar: 2.9 },
  },

  // Çeşitli soslar ve tatlandırıcılar
  {
    id: '146',
    name: 'Mayonez',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 680, protein: 1.1, carbs: 1.3, fat: 74.9, fiber: 0, sugar: 1.3 },
  },
  {
    id: '147',
    name: 'Ketçap',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 112, protein: 1.7, carbs: 26.2, fat: 0.5, fiber: 0.9, sugar: 21.9 },
  },
  {
    id: '148',
    name: 'Bal',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 304, protein: 0.3, carbs: 82.4, fat: 0, fiber: 0.2, sugar: 82.1 },
  },
  {
    id: '149',
    name: 'Tahin',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 595, protein: 17.4, carbs: 23.4, fat: 53.8, fiber: 9.3, sugar: 0.5 },
  },
  {
    id: '150',
    name: 'Zeytin (Siyah)',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 115, protein: 0.8, carbs: 6.3, fat: 10.7, fiber: 3.3, sugar: 0.5 },
  },
  {
    id: '151',
    name: 'Zeytin (Yeşil)',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 145, protein: 1.0, carbs: 3.8, fat: 15.3, fiber: 3.3, sugar: 0.0 },
  },

  // Kahvaltılık gevrekler
  {
    id: '152',
    name: 'Mısır Gevreği',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 368, protein: 7.5, carbs: 84.1, fat: 0.8, fiber: 3.3, sugar: 7.1 },
  },
  {
    id: '153',
    name: 'Müsli',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 384, protein: 10.6, carbs: 68.8, fat: 7.9, fiber: 10.1, sugar: 16.4 },
  },
  {
    id: '154',
    name: 'Granola',
    category: 'tahil',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 471, protein: 8.5, carbs: 64.4, fat: 20.3, fiber: 7.2, sugar: 24.6 },
  },

  // Fast food ekstra
  {
    id: '155',
    name: 'Cheeseburger',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 303, protein: 15.4, carbs: 30.3, fat: 14.8, fiber: 1.0, sugar: 6.3 },
  },
  {
    id: '156',
    name: 'Patates Kızartması',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 312, protein: 3.4, carbs: 41.4, fat: 15, fiber: 3.8, sugar: 0.3 },
  },
  {
    id: '157',
    name: 'Soğan Halkası',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 411, protein: 5.5, carbs: 47.6, fat: 22.9, fiber: 2.1, sugar: 6.5 },
  },
  {
    id: '158',
    name: 'Tavuk Nugget',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 296, protein: 14.6, carbs: 15.9, fat: 19.6, fiber: 0.8, sugar: 0.5 },
  },
  {
    id: '159',
    name: 'Makarna Salatası',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 189, protein: 4.6, carbs: 23.8, fat: 8.2, fiber: 1.2, sugar: 2.1 },
  },
  {
    id: '160',
    name: 'Milkshake (Çikolatalı)',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 112, protein: 3.8, carbs: 19.2, fat: 2.7, fiber: 0.5, sugar: 18.1 },
  },
  {
    id: '161',
    name: 'Dondurmalı Kahve',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 96, protein: 2.1, carbs: 15.4, fat: 3.0, fiber: 0.1, sugar: 14.2 },
  },
  {
    id: '162',
    name: 'Smoothie (Karışık Meyve)',
    category: 'icecek',
    amount: 100,
    unit: 'ml',
    nutrition: { calories: 56, protein: 0.8, carbs: 13.5, fat: 0.3, fiber: 0.8, sugar: 10.7 },
  },

  // Yöresel Türk yemekleri
  {
    id: '163',
    name: 'Kuru Fasulye',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 155, protein: 9.7, carbs: 27.8, fat: 1.5, fiber: 7.0, sugar: 1.2 },
  },
  {
    id: '164',
    name: 'Pilav',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 185, protein: 3.4, carbs: 36.2, fat: 3.1, fiber: 0.5, sugar: 0.1 },
  },
  {
    id: '165',
    name: 'İmam Bayıldı',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 138, protein: 1.5, carbs: 7.8, fat: 11.2, fiber: 3.7, sugar: 4.2 },
  },
  {
    id: '166',
    name: 'Dolma (Biber)',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 142, protein: 3.8, carbs: 16.5, fat: 6.8, fiber: 2.4, sugar: 3.1 },
  },
  {
    id: '167',
    name: 'Sarma (Yaprak)',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 156, protein: 4.1, carbs: 17.2, fat: 7.5, fiber: 2.8, sugar: 1.7 },
  },
  {
    id: '168',
    name: 'Köfte',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 248, protein: 18.5, carbs: 10.1, fat: 15.7, fiber: 0.8, sugar: 1.0 },
  },
  {
    id: '169',
    name: 'Mercimek Çorbası',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 98, protein: 5.8, carbs: 15.2, fat: 2.3, fiber: 3.7, sugar: 1.8 },
  },
  {
    id: '170',
    name: 'Tarhana Çorbası',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 81, protein: 3.5, carbs: 14.2, fat: 1.8, fiber: 1.2, sugar: 2.1 },
  },
  {
    id: '171',
    name: 'Menemen',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 131, protein: 6.5, carbs: 5.8, fat: 9.7, fiber: 1.6, sugar: 3.7 },
  },
  {
    id: '172',
    name: 'Karnıyarık',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 165, protein: 5.4, carbs: 9.6, fat: 12.3, fiber: 3.5, sugar: 4.1 },
  },
  {
    id: '173',
    name: 'Cacık',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 62, protein: 2.8, carbs: 5.2, fat: 3.1, fiber: 0.5, sugar: 3.7 },
  },
  {
    id: '174',
    name: 'Şakşuka',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 112, protein: 1.5, carbs: 7.9, fat: 8.5, fiber: 2.8, sugar: 5.4 },
  },
  {
    id: '175',
    name: 'Piyaz',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 142, protein: 6.7, carbs: 21.5, fat: 3.8, fiber: 6.5, sugar: 2.1 },
  },
  {
    id: '176',
    name: 'Yaprak Sarması (Zeytinyağlı)',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 142, protein: 3.2, carbs: 18.6, fat: 6.8, fiber: 3.1, sugar: 1.5 },
  },
  {
    id: '177',
    name: 'Etli Ekmek',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 235, protein: 12.5, carbs: 36.8, fat: 5.4, fiber: 1.8, sugar: 1.2 },
  },
  {
    id: '178',
    name: 'İskender Kebap',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 258, protein: 16.5, carbs: 21.2, fat: 12.7, fiber: 0.8, sugar: 2.5 },
  },
  {
    id: '179',
    name: 'Beyti Kebap',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 271, protein: 18.8, carbs: 19.8, fat: 13.2, fiber: 0.6, sugar: 1.8 },
  },
  {
    id: '180',
    name: 'Kurufasulye Pilav',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 171, protein: 6.7, carbs: 32.1, fat: 2.3, fiber: 3.8, sugar: 0.7 },
  },

  // Balkan ve Ortadoğu mutfağı
  {
    id: '181',
    name: 'Hummus',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 166, protein: 7.9, carbs: 14.3, fat: 9.6, fiber: 6.0, sugar: 0.4 },
  },
  {
    id: '182',
    name: 'Falafel',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 333, protein: 13.3, carbs: 31.8, fat: 17.8, fiber: 12.5, sugar: 0.6 },
  },
  {
    id: '183',
    name: 'Tabbouleh',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 182, protein: 3.7, carbs: 24.9, fat: 8.2, fiber: 3.8, sugar: 2.1 },
  },
  {
    id: '184',
    name: 'Börek (Peynirli)',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 263, protein: 8.5, carbs: 31.2, fat: 12.3, fiber: 1.2, sugar: 1.4 },
  },
  {
    id: '185',
    name: 'Moussaka',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 172, protein: 6.7, carbs: 12.8, fat: 10.5, fiber: 2.4, sugar: 6.1 },
  },

  // Kahvaltılık ürünler
  {
    id: '186',
    name: 'Reçel (Çilek)',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 253, protein: 0.5, carbs: 63.2, fat: 0.1, fiber: 0.8, sugar: 62.4 },
  },
  {
    id: '187',
    name: 'Reçel (Kayısı)',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 250, protein: 0.5, carbs: 62.5, fat: 0.1, fiber: 1.0, sugar: 61.5 },
  },
  {
    id: '188',
    name: 'Fındık Ezmesi',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 635, protein: 10.0, carbs: 30.5, fat: 54.3, fiber: 3.8, sugar: 27.3 },
  },
  {
    id: '189',
    name: 'Tereyağı',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81.1, fiber: 0, sugar: 0.1 },
  },
  {
    id: '190',
    name: 'Salam',
    category: 'et',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 278, protein: 14.2, carbs: 2.4, fat: 23.5, fiber: 0, sugar: 1.0 },
  },
  {
    id: '191',
    name: 'Sosis',
    category: 'et',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 324, protein: 13.4, carbs: 3.2, fat: 29.0, fiber: 0, sugar: 1.5 },
  },
  {
    id: '192',
    name: 'Sucuk',
    category: 'et',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 380, protein: 18.5, carbs: 1.8, fat: 32.5, fiber: 0, sugar: 0.5 },
  },
  {
    id: '193',
    name: 'Pastırma',
    category: 'et',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 315, protein: 42.2, carbs: 0.8, fat: 15.7, fiber: 0, sugar: 0.2 },
  },
  {
    id: '194',
    name: 'Kaymak',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 459, protein: 2.5, carbs: 3.0, fat: 48.0, fiber: 0, sugar: 3.0 },
  },
  {
    id: '195',
    name: 'Yoğurt (Meyveli)',
    category: 'sut_urunleri',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 87, protein: 3.2, carbs: 13.8, fat: 2.1, fiber: 0.2, sugar: 13.6 },
  },
  {
    id: '196',
    name: 'Zeytin Ezmesi',
    category: 'atistirmalik',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 265, protein: 2.0, carbs: 3.8, fat: 27.0, fiber: 3.2, sugar: 0.5 },
  },

  // Uluslararası mutfaklar
  {
    id: '197',
    name: 'Sushi (Karışık)',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 150, protein: 5.8, carbs: 30.1, fat: 0.7, fiber: 0.5, sugar: 2.0 },
  },
  {
    id: '198',
    name: 'Pad Thai',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 172, protein: 8.5, carbs: 26.2, fat: 5.0, fiber: 1.2, sugar: 7.3 },
  },
  {
    id: '199',
    name: 'Paella',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 156, protein: 7.6, carbs: 25.8, fat: 3.1, fiber: 0.9, sugar: 1.2 },
  },
  {
    id: '200',
    name: 'Risotto',
    category: 'hazir_yemek',
    amount: 100,
    unit: 'g',
    nutrition: { calories: 174, protein: 3.8, carbs: 27.5, fat: 5.6, fiber: 0.5, sugar: 0.7 },
  },
];

// Özel yemekler için hafıza
let customFoods: FoodData[] = [];

// AsyncStorage'daki özel yemekleri yükle
export const loadCustomFoods = async (): Promise<void> => {
  try {
    console.log('loadCustomFoods çağrıldı');
    const storedCustomFoods = await AsyncStorage.getItem('@HealthTrackAI:customFoods');
    if (storedCustomFoods) {
      console.log('Kayıtlı özel yemekler bulundu:', storedCustomFoods);
      customFoods = JSON.parse(storedCustomFoods);
    } else {
      console.log('Kayıtlı özel yemek bulunamadı');
      customFoods = [];
    }
  } catch (error) {
    console.error('Özel yemekler yüklenirken hata oluştu:', error);
    customFoods = [];
  }
};

// Özel yemekleri AsyncStorage'a kaydet
export const saveCustomFoods = async (): Promise<void> => {
  try {
    console.log('saveCustomFoods çağrıldı, kayıt edilecek veri:', JSON.stringify(customFoods));
    await AsyncStorage.setItem('@HealthTrackAI:customFoods', JSON.stringify(customFoods));
    console.log('Özel yemekler başarıyla kaydedildi');
  } catch (error) {
    console.error('Özel yemekler kaydedilirken hata oluştu:', error);
  }
};

// Uygulama başlangıcında özel yemekleri yükle
loadCustomFoods();

// Özel yemek ekle
export const addCustomFood = async (food: Omit<FoodData, 'id' | 'isCustom'>): Promise<FoodData> => {
  console.log('addCustomFood çağrıldı, eklenecek yemek:', food);

  const newCustomFood: FoodData = {
    ...food,
    id: `custom_${Date.now()}`,
    isCustom: true,
  };

  customFoods.push(newCustomFood);
  await saveCustomFoods();

  console.log('Yeni özel yemek eklendi:', newCustomFood);
  return newCustomFood;
};

// Özel yemek sil
export const removeCustomFood = async (id: string): Promise<void> => {
  customFoods = customFoods.filter(food => food.id !== id);
  await saveCustomFoods();
};

// Tüm yemekleri getir (standart + özel)
export const getAllFoods = (): FoodData[] => {
  return [...foodDatabase, ...customFoods];
};

// Türkçe karakterleri İngilizce karakterlere dönüştüren yardımcı fonksiyon
const normalizeTurkishText = (text: string): string => {
  return text
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o');
};

// İsme göre arama fonksiyonu
export const searchByName = (query: string): FoodData[] => {
  if (!query || query.trim() === '') {
    return getAllFoods().slice(0, 10); // Boş sorgu durumunda ilk 10 öğeyi döndür
  }

  const normalizedQuery = normalizeTurkishText(query.toLowerCase().trim());

  return getAllFoods()
    .filter(food => {
      const normalizedName = normalizeTurkishText(food.name.toLowerCase());
      return normalizedName.includes(normalizedQuery);
    })
    .slice(0, 20); // En fazla 20 sonuç göster
};

// Öğün tipine göre sık kullanılan yiyecekler
export const getFrequentFoodsForMealType = (
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
): FoodData[] => {
  switch (mealType) {
    case 'breakfast':
      return foodDatabase.filter(
        food =>
          food.id === '18' ||
          food.id === '19' ||
          food.id === '20' ||
          food.id === '22' ||
          food.id === '25' ||
          food.id === '2' ||
          food.id === '34',
      );
    case 'lunch':
    case 'dinner':
      return foodDatabase.filter(
        food =>
          food.id === '13' ||
          food.id === '23' ||
          food.id === '24' ||
          food.id === '26' ||
          food.id === '10' ||
          food.id === '15' ||
          food.id === '32',
      );
    case 'snack':
      return foodDatabase.filter(
        food =>
          food.id === '1' ||
          food.id === '2' ||
          food.id === '27' ||
          food.id === '28' ||
          food.id === '29' ||
          food.id === '42' ||
          food.id === '35',
      );
    default:
      return [];
  }
};

// Kategori bazlı filtreleme fonksiyonu
export const filterByCategory = (category: FoodCategory): FoodData[] => {
  return getAllFoods().filter(food => food.category === category);
};

// ID'ye göre yemek getirme
export const getFoodById = (id: string): FoodData | undefined => {
  // Önce standart veritabanında ara
  const standardFood = foodDatabase.find(food => food.id === id);
  if (standardFood) {
    return standardFood;
  }

  // Standart veritabanında bulunamazsa özel yemeklerde ara
  return customFoods.find(food => food.id === id);
};

export default foodDatabase;
