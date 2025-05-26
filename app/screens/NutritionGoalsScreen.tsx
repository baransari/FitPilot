import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  Divider,
  HelperText as PaperHelperText,
  useTheme,
} from '../utils/paperComponents';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import useFoodTracker from '../hooks/useFoodTracker';
import { DailyGoals } from '../store/foodTrackerSlice';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

type NutritionGoalsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type NutritionGoalsScreenProps = {
  navigation: NutritionGoalsScreenNavigationProp;
};

interface TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  mode?: 'outlined' | 'flat';
  error?: boolean;
  style?: object;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  mode = 'flat',
  error = false,
  style,
}) => {
  const theme = useTheme();
  const themeAsAny = theme as any;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        {
          marginBottom: 8,
          borderWidth: mode === 'outlined' ? 1 : 0,
          borderColor: error
            ? themeAsAny.colors.error
            : isFocused
            ? themeAsAny.colors.primary
            : themeAsAny.colors.outline,
          borderRadius: 4,
          backgroundColor: themeAsAny.colors.surface,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          color: error ? themeAsAny.colors.error : themeAsAny.colors.primary,
          marginLeft: 12,
          marginTop: 8,
        }}
      >
        {label}
      </Text>
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={{
          padding: 12,
          paddingTop: 8,
          fontSize: 16,
          color: themeAsAny.colors.onSurface,
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

interface TitleProps {
  children: React.ReactNode;
  style?: object;
}

const Title: React.FC<TitleProps> = ({ children, style }) => {
  const theme = useTheme();
  const themeAsAny = theme as any;
  return (
    <Text
      style={[
        {
          fontSize: 22,
          fontWeight: 'bold',
          color: themeAsAny.colors.onSurface,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

interface HelperTextProps {
  children: React.ReactNode;
  type?: 'info' | 'error';
}

const HelperText: React.FC<HelperTextProps> = ({ children, type = 'info' }) => {
  const theme = useTheme();
  const themeAsAny = theme as any;

  return (
    <Text
      style={{
        fontSize: 12,
        color: type === 'error' ? themeAsAny.colors.error : themeAsAny.colors.onSurfaceVariant,
        marginLeft: 12,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
};

const NutritionGoalsScreen: React.FC<NutritionGoalsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const themeAsAny = theme as any;
  const { goals, updateNutritionGoals } = useFoodTracker();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [formValues, setFormValues] = useState<DailyGoals>({
    calories: goals?.calories || 2000,
    protein: goals?.protein || 70,
    carbs: goals?.carbs || 250,
    fat: goals?.fat || 70,
    fiber: goals?.fiber || 25,
    sugar: goals?.sugar || 50,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleValueChange = (field: keyof DailyGoals, value: string) => {
    const numericValue = value.trim() === '' ? 0 : parseFloat(value);
    setFormValues(prev => ({ ...prev, [field]: numericValue }));

    validateField(field, numericValue);
  };

  const validateField = (field: keyof DailyGoals, value: number) => {
    let fieldErrors = { ...errors };

    if (isNaN(value) || value <= 0) {
      fieldErrors[field] = t('errors.enterValidValue', 'Geçerli bir değer giriniz');
    } else {
      delete fieldErrors[field];
    }

    setErrors(fieldErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const fields: Array<keyof DailyGoals> = [
      'calories',
      'protein',
      'carbs',
      'fat',
      'fiber',
      'sugar',
    ];

    fields.forEach(field => {
      const value = formValues[field];

      if (field === 'fiber' || field === 'sugar') {
        const numValue = value !== undefined && value !== null ? Number(value) : 0;
        if (numValue <= 0 || isNaN(numValue)) {
          newErrors[field] = t('errors.enterValidValue', 'Geçerli bir değer giriniz');
          isValid = false;
        }
      } else {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0) {
          newErrors[field] = t('errors.enterValidValue', 'Geçerli bir değer giriniz');
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveGoals = () => {
    if (validateForm()) {
      updateNutritionGoals(formValues);
      navigation.goBack();
    }
  };

  const calculateRecommendedCalories = (
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female',
    activityLevel: string,
  ): number => {
    let bmr = 0;

    if (gender === 'male') {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }

    let activityMultiplier = 1.2;
    switch (activityLevel) {
      case 'light':
        activityMultiplier = 1.375;
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        break;
      case 'active':
        activityMultiplier = 1.725;
        break;
      case 'very_active':
        activityMultiplier = 1.9;
        break;
    }

    return Math.round(bmr * activityMultiplier);
  };

  const suggestDefaultValues = () => {
    const weight = 70;
    const height = 170;
    const age = 30;
    const gender = 'male' as const;
    const activityLevel = 'moderate';

    const recommendedCalories = calculateRecommendedCalories(
      weight,
      height,
      age,
      gender,
      activityLevel,
    );

    const suggestedValues: DailyGoals = {
      calories: user?.caloriesGoal || recommendedCalories,
      protein: Math.round(weight * 1.6),
      carbs: Math.round((recommendedCalories * 0.45) / 4),
      fat: Math.round((recommendedCalories * 0.3) / 9),
      fiber: 25,
      sugar: 37,
    };

    setFormValues(suggestedValues);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeAsAny.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title style={[styles.title, { color: themeAsAny.colors.text }]}>
          {t('nutritionGoals.title', 'Günlük Besin Hedefleri')}
        </Title>

        <Card style={[styles.card, { backgroundColor: themeAsAny.colors.surface }]}>
          <Card.Content>
            <TextInput
              label={t('nutritionGoals.calorieGoal', 'Kalori (kcal)')}
              value={formValues.calories.toString()}
              onChangeText={value => handleValueChange('calories', value)}
              keyboardType="numeric"
              mode="outlined"
              error={!!errors.calories}
              style={styles.input}
            />
            {errors.calories ? <HelperText type="error">{errors.calories}</HelperText> : null}

            <TextInput
              label={t('nutritionGoals.protein', 'Protein (g)')}
              value={formValues.protein.toString()}
              onChangeText={value => handleValueChange('protein', value)}
              keyboardType="numeric"
              mode="outlined"
              error={!!errors.protein}
              style={styles.input}
            />
            {errors.protein ? <HelperText type="error">{errors.protein}</HelperText> : null}

            <TextInput
              label={t('nutritionGoals.carbs', 'Karbonhidrat (g)')}
              value={formValues.carbs.toString()}
              onChangeText={value => handleValueChange('carbs', value)}
              keyboardType="numeric"
              mode="outlined"
              error={!!errors.carbs}
              style={styles.input}
            />
            {errors.carbs ? <HelperText type="error">{errors.carbs}</HelperText> : null}

            <TextInput
              label={t('nutritionGoals.fat', 'Yağ (g)')}
              value={formValues.fat.toString()}
              onChangeText={value => handleValueChange('fat', value)}
              keyboardType="numeric"
              mode="outlined"
              error={!!errors.fat}
              style={styles.input}
            />
            {errors.fat ? <HelperText type="error">{errors.fat}</HelperText> : null}

            <Divider style={styles.divider} />

            <TextInput
              label={t('nutritionGoals.fiber', 'Lif (g)')}
              value={(formValues.fiber ?? 0).toString()}
              onChangeText={value => handleValueChange('fiber', value)}
              keyboardType="numeric"
              mode="outlined"
              error={!!errors.fiber}
              style={styles.input}
            />
            {errors.fiber ? <HelperText type="error">{errors.fiber}</HelperText> : null}

            <TextInput
              label={t('nutritionGoals.sugar', 'Şeker (g)')}
              value={(formValues.sugar ?? 0).toString()}
              onChangeText={value => handleValueChange('sugar', value)}
              keyboardType="numeric"
              mode="outlined"
              error={!!errors.sugar}
              style={styles.input}
            />
            {errors.sugar ? <HelperText type="error">{errors.sugar}</HelperText> : null}

            <Text style={[styles.helperText, { color: themeAsAny.colors.onSurfaceVariant }]}>
              {t('nutritionGoals.helperText', '* Günlük besin hedeflerinizi vücut tipinize ve aktivite seviyenize göre ayarlayın.')}
            </Text>

            <Button 
              mode="outlined" 
              onPress={suggestDefaultValues} 
              style={styles.suggestButton}
              color={themeAsAny.colors.primary}
            >
              {t('nutritionGoals.useRecommendedValues', 'Önerilen Değerleri Kullan')}
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleSaveGoals} 
            style={styles.saveButton}
            color={themeAsAny.colors.primary}
          >
            {t('save', 'Kaydet')}
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => navigation.goBack()} 
            style={styles.cancelButton}
            color={themeAsAny.colors.primary}
          >
            {t('cancel', 'İptal')}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  helperText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 16,
  },
  suggestButton: {
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default NutritionGoalsScreen;
