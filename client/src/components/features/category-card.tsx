import { Link } from 'react-router-dom';
import type { Category } from '@amazon-clone/shared/types';
import { useThemeStyles } from '@/stores/theme-store';

type CategoryCardProps = {
  category: Category;
};

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const ts = useThemeStyles();

  return (
    <Link to={`/categories/${category.slug}`} className={`group relative overflow-hidden bg-gradient-to-br from-amazon-blue/5 to-white transition-all ${ts.categoryCard}`}>
      {category.image ? (
        <div className="flex h-32 items-center justify-center p-4">
          <img src={category.image} alt={category.name} className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-110" loading="lazy" />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center">
          <div className={`flex h-14 w-14 items-center justify-center bg-amazon-blue/10 text-xl font-bold text-amazon-blue group-hover:bg-amazon-blue/20 ${ts.thumbnail}`}>
            {category.name.charAt(0)}
          </div>
        </div>
      )}
      <div className="px-3 pb-3 text-center">
        <h3 className="text-sm font-semibold text-gray-700 group-hover:text-amazon-blue">{category.name}</h3>
      </div>
    </Link>
  );
};
