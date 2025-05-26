import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

// Kategori türlerini sabit olarak tanımlayalım
const getCategoryDefinitions = (t: any) => [
  { id: 'cardio', label: t('exercise.categories.cardio', 'Cardio'), icon: 'run' },
  { id: 'strength', label: t('exercise.categories.strength', 'Strength'), icon: 'weight-lifter' },
  { id: 'flexibility', label: t('exercise.categories.flexibility', 'Flexibility'), icon: 'yoga' },
  { id: 'balance', label: t('exercise.categories.balance', 'Balance'), icon: 'scale-balance' },
];

// Custom Chip component
interface CustomChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon: string;
  primaryColor: string;
}

const CustomChip: React.FC<CustomChipProps> = ({ label, selected, onPress, icon, primaryColor }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceVariant,
          borderColor: theme.colors.primary,
        },
      ]}
      onPress={onPress}
    >
      <Icon
        name={icon}
        size={18}
        color={selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
        style={{ marginRight: 6 }}
      />
      <Text
        style={{
          color: selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
          fontWeight: selected ? 'bold' : 'normal',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Divider component
const Divider = () => {
  const { theme } = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />;
};

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (exercise: {
    name: string;
    category: string;
    caloriesBurnedPerMinute: number;
    description: string;
  }) => void;
}

const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ visible, onClose, onSave }) => {
  const { theme, isDarkMode } = useTheme();
  const systemColorScheme = useColorScheme();
  const actualDarkMode = isDarkMode ?? systemColorScheme === 'dark';
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('cardio');
  const [caloriesBurnedPerMinute, setCaloriesBurnedPerMinute] = useState('5');
  const [description, setDescription] = useState('');
  
  // Get categories with translations
  const EXERCISE_CATEGORIES = getCategoryDefinitions(t);

  // Modal her açıldığında formu sıfırla
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setName('');
    setCategory('cardio');
    setCaloriesBurnedPerMinute('5');
    setDescription('');
  };

  const handleCaloriesChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setCaloriesBurnedPerMinute(numericValue);
  };

  const handleSave = () => {
    if (name.trim() === '') {
      Alert.alert(
        t('exercise.error', 'Error'), 
        t('exercise.errorEmptyName', 'Please enter an exercise name')
      );
      return;
    }

    if (isNaN(parseFloat(caloriesBurnedPerMinute)) || parseFloat(caloriesBurnedPerMinute) <= 0) {
      Alert.alert(
        t('exercise.error', 'Error'), 
        t('exercise.errorInvalidCalories', 'Please enter a valid calorie value')
      );
      return;
    }

    onSave({
      name: name.trim(),
      category,
      caloriesBurnedPerMinute: parseFloat(caloriesBurnedPerMinute),
      description: description.trim(),
    });
  };

  return (
    <Modal 
      animationType="slide" 
      transparent={true} 
      visible={visible} 
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.centeredView}>
        <View style={[
          styles.modalView, 
          { 
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.shadow,
          }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {t('exercise.addNewExercise', 'Add New Exercise')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              {t('exercise.exerciseName', 'Exercise Name')}
            </Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  borderColor: theme.colors.outline,
                  color: theme.colors.onSurface,
                  backgroundColor: theme.colors.surfaceVariant,
                }
              ]}
              value={name}
              onChangeText={setName}
              placeholder={t('exercise.enterExerciseName', 'Enter exercise name')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />

            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              {t('exercise.category', 'Category')}
            </Text>
            <View style={styles.categoriesContainer}>
              {EXERCISE_CATEGORIES.map(cat => (
                <CustomChip
                  key={cat.id}
                  label={cat.label}
                  selected={category === cat.id}
                  onPress={() => setCategory(cat.id)}
                  icon={cat.icon}
                  primaryColor={theme.colors.primary}
                />
              ))}
            </View>

            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              {t('exercise.caloriesPerMinute', 'Calories Per Minute (kcal)')}
            </Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  borderColor: theme.colors.outline,
                  color: theme.colors.onSurface,
                  backgroundColor: theme.colors.surfaceVariant,
                }
              ]}
              value={caloriesBurnedPerMinute}
              onChangeText={handleCaloriesChange}
              keyboardType="numeric"
              placeholder={t('exercise.enterCaloriesPerMinute', 'Enter calories burned per minute')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />

            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              {t('exercise.description', 'Description')}
            </Text>
            <TextInput
              style={[
                styles.input, 
                styles.textArea, 
                { 
                  borderColor: theme.colors.outline,
                  color: theme.colors.onSurface,
                  backgroundColor: theme.colors.surfaceVariant,
                }
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder={t('exercise.descriptionPlaceholder', 'Description about the exercise (optional)')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              multiline
              numberOfLines={4}
            />
          </ScrollView>

          <Divider />

          <View style={styles.buttonContainer}>
            <Pressable 
              style={[
                styles.cancelButton, 
                { borderColor: theme.colors.outline }
              ]} 
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.onSurfaceVariant }]}>
                {t('cancel', 'Cancel')}
              </Text>
            </Pressable>
            <Pressable 
              style={[
                styles.saveButton, 
                { backgroundColor: theme.colors.primary }
              ]} 
              onPress={handleSave}
            >
              <Text style={[styles.saveButtonText, { color: theme.colors.onPrimary }]}>
                {t('save', 'Save')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalView: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    maxHeight: '70%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddExerciseModal;
