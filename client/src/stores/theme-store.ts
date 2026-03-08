type ThemeStyles = {
  card: string;
  cardSkeleton: string;
  categoryCard: string;
  button: string;
  buttonLabel: string;
  ctaPrimary: string;
  ctaSecondary: string;
  thumbnail: string;
  perkCard: string;
  filterPill: string;
  filterPillActive: string;
  selectStyle: string;
  sectionTitle: string;
};

const styles: ThemeStyles = {
  card: 'rounded-lg border border-gray-200 hover:border-gray-400',
  cardSkeleton: 'rounded-lg border border-gray-200',
  categoryCard: 'rounded-lg border border-gray-200 hover:border-gray-400',
  button: 'rounded-full',
  buttonLabel: '',
  ctaPrimary: 'rounded-full',
  ctaSecondary: 'rounded-full border-2',
  thumbnail: 'rounded-lg border-2',
  perkCard: 'rounded-lg border border-gray-200',
  filterPill: 'rounded-full border border-gray-300',
  filterPillActive: 'rounded-full border border-amazon-blue bg-amazon-blue text-white',
  selectStyle: 'rounded-full border border-gray-300 bg-white',
  sectionTitle: 'text-lg font-bold text-gray-900',
};

export const useThemeStyles = (): ThemeStyles => styles;
