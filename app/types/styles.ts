import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { ExtendedMD3Theme } from 'react-native-paper';

// Base style type that can be extended by other components
export interface BaseStyles {
  container?: ViewStyle;
  content?: ViewStyle;
  text?: TextStyle;
  image?: ImageStyle;
}

// Common styles shared across multiple components
export interface CommonStyles extends BaseStyles {
  safeArea: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  card: ViewStyle;
  divider: ViewStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  input: TextStyle;
  label: TextStyle;
  errorText: TextStyle;
}

// Screen-specific styles
export interface HomeScreenStyles extends CommonStyles {
  headerContainer: ViewStyle;
  headerContent: ViewStyle;
  greetingText: TextStyle;
  welcomeText: TextStyle;
  dateText: TextStyle;
  avatar: ViewStyle;
  streakChip: ViewStyle;
  streakChipText: TextStyle;
  statsRow: ViewStyle;
  statsCard: ViewStyle;
  statsCardContent: ViewStyle;
  statsIconContainer: ViewStyle;
  statsTitle: TextStyle;
  statsLabel: TextStyle;
  progressBarContainer: ViewStyle;
  progressBar: ViewStyle;
  progressText: TextStyle;
  sectionTitleContainer: ViewStyle;
  sectionTitle: TextStyle;
  workoutProgressContainer: ViewStyle;
  workoutProgressInfo: ViewStyle;
  workoutProgressText: TextStyle;
  workoutProgressCount: TextStyle;
  workoutProgressPercentage: TextStyle;
  workoutProgressBar: ViewStyle;
  workoutProgressBarFill: ViewStyle;
  adviceContainer: ViewStyle;
  adviceIcon: ViewStyle;
  adviceContent: ViewStyle;
  adviceText: TextStyle;
  activityItem: ViewStyle;
  activityTimeContainer: ViewStyle;
  activityTime: TextStyle;
  activityContentContainer: ViewStyle;
  activityName: TextStyle;
  activityDuration: TextStyle;
  nutritionContainer: ViewStyle;
  nutritionItem: ViewStyle;
  nutritionLabel: TextStyle;
  nutritionValue: TextStyle;
  nutritionUnit: TextStyle;
  nutritionBarContainer: ViewStyle;
  nutritionBar: ViewStyle;
  nutritionProgress: ViewStyle;
  nutritionPercentage: TextStyle;
  cardActions: ViewStyle;
  actionButton: ViewStyle;
  statsCardButton: ViewStyle;
  statsCardButtonText: TextStyle;
}

export interface ProfileScreenStyles extends CommonStyles {
  scrollContainer: ViewStyle;
  scrollContentContainer: ViewStyle;
  profileHeader: ViewStyle;
  avatarContainer: ViewStyle;
  avatarPlaceholder: ViewStyle;
  avatarLetter: TextStyle;
  profileInfo: ViewStyle;
  editButton: ViewStyle;
  editButtonLabel: TextStyle;
  sectionTitle: TextStyle;
  metricsContainer: ViewStyle;
  metricItem: ViewStyle;
  metricValue: TextStyle;
  metricLabel: TextStyle;
  settingsOptionContainer: ViewStyle;
  settingsOptionTitle: TextStyle;
}

export interface FoodTrackerStyles extends CommonStyles {
  headerBar: ViewStyle;
  headerIcons: ViewStyle;
  iconButton: ViewStyle;
  scrollContent: ViewStyle;
  calorieCard: ViewStyle;
  calorieContent: ViewStyle;
  calorieRow: ViewStyle;
  calorieNumber: TextStyle;
  calorieText: TextStyle;
  goalNumber: TextStyle;
  goalText: TextStyle;
  progressBar: ViewStyle;
  summaryCard: ViewStyle;
  summaryHeader: ViewStyle;
  summaryTitle: TextStyle;
  dateText: TextStyle;
  dividerLine: ViewStyle;
  mealRow: ViewStyle;
  mealIconContainer: ViewStyle;
  mealInfo: ViewStyle;
  mealName: TextStyle;
  mealStats: TextStyle;
  addButton: ViewStyle;
  mealDivider: ViewStyle;
  nutritionCard: ViewStyle;
  nutritionHeader: ViewStyle;
  nutritionTitle: TextStyle;
  nutritionGrid: ViewStyle;
  nutritionItem: ViewStyle;
  nutritionLabel: TextStyle;
  nutritionValue: TextStyle;
  nutritionUnit: TextStyle;
  mealCard: ViewStyle;
  mealCardIcon: ViewStyle;
  mealAddButton: ViewStyle;
  mealCardContent: ViewStyle;
  emptyMeal: TextStyle;
  foodEntry: ViewStyle;
  foodEntryInfo: ViewStyle;
  foodEntryName: TextStyle;
  foodEntryDetails: TextStyle;
  deleteButton: ViewStyle;
  floatingActionButton: ViewStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  divider: ViewStyle;
  formSection: ViewStyle;
  formGrid: ViewStyle;
  gridItem: ViewStyle;
  customFoodInput: ViewStyle;
  helpText: TextStyle;
  categoryScroll: ViewStyle;
  categoryChip: ViewStyle;
  foodItemRight: ViewStyle;
  amountInput: ViewStyle;
  unitText: TextStyle;
  avatarIcon: ViewStyle;
}

export interface ExerciseScreenStyles extends CommonStyles {
  exerciseDetail: TextStyle;
  difficultyIndicator: ViewStyle;
  editButtonContainer: ViewStyle;
  editButtonText: TextStyle;
  startButton: ViewStyle;
  startButtonText: TextStyle;
  addButton: ViewStyle;
  buttonIcon: ViewStyle;
  statsCard: ViewStyle;
  statsRow: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
}

export interface SleepTrackerStyles extends CommonStyles {
  sleepSummaryCard: ViewStyle;
  sleepSummary: ViewStyle;
  sleepTime: ViewStyle;
  timeLabel: TextStyle;
  timeValue: TextStyle;
  sleepDuration: ViewStyle;
  durationValue: TextStyle;
  qualityIndicator: ViewStyle;
  qualityText: TextStyle;
  statsRow: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
}

export interface StepTrackerStyles extends CommonStyles {
  headerRight: ViewStyle;
  stepsCircle: ViewStyle;
  stepsValue: TextStyle;
  stepsLabel: TextStyle;
  progressContainer: ViewStyle;
  progressHeader: ViewStyle;
  progressText: TextStyle;
  progressBar: ViewStyle;
  remainingSteps: TextStyle;
  statsRow: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
}

// Component-specific styles
export interface LoadingComponentStyles extends BaseStyles {
  container: ViewStyle;
}

export interface AddExerciseModalStyles extends BaseStyles {
  centeredView: ViewStyle;
  modalView: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  formContainer: ViewStyle;
  label: TextStyle;
  input: TextStyle;
  textArea: TextStyle;
  categoriesContainer: ViewStyle;
  categoryChip: ViewStyle;
  buttonContainer: ViewStyle;
  cancelButton: ViewStyle;
  saveButton: ViewStyle;
}

// Generic style type that can be used for StyleSheet.create
export type StylesType = {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
};

// Theme-aware style type
export type ThemedStyle = (theme: ExtendedMD3Theme) => StylesType;
