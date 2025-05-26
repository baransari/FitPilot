/**
 * Bileşen Exportları
 * 
 * Bu dosya, uygulama genelinde kullanılan tüm genel bileşenlerin merkezi export noktasıdır.
 * Bileşenler, kullanım alanlarına göre gruplandırılmıştır.
 */

/**
 * Uygulama genelinde kullanılan bileşenleri dışa aktarır
 */

import LoadingComponent from './LoadingComponent';
import AddExerciseModal from './AddExerciseModal';
import EditWorkoutPlanModal from './EditWorkoutPlanModal';
import AutoUpdaterComponent from './AutoUpdaterComponent';

// Tema uyumlu bileşenlerimiz - koyu mod desteği ile
import * as CustomComponents from '../utils/paperComponents';

// Ana bileşenlerimizi dışa aktar
export {
  LoadingComponent,
  AddExerciseModal,
  EditWorkoutPlanModal,
  AutoUpdaterComponent,
};

// Custom tema uyumlu bileşenleri dışa aktar
export const {
  Text,
  Button,
  Card,
  Surface,
  Divider,
  Switch,
  TextInput,
  HelperText,
} = CustomComponents;

export default {
  LoadingComponent,
  AddExerciseModal,
  EditWorkoutPlanModal,
  AutoUpdaterComponent,
  ...CustomComponents,
};

/**
 * Not: Yeni bir bileşen eklerken, lütfen uygun kategoriye ekleyin veya
 * gerekirse yeni bir kategori oluşturun. Bu, kod organizasyonunu ve okunabilirliği artırır.
 */
