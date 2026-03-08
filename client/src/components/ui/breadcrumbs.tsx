import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav aria-label="Breadcrumb" className="text-sm text-gray-400">
    <ol className="flex flex-wrap items-center gap-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" />}
            {isLast || !item.href ? (
              <span className={isLast ? 'font-medium text-gray-700' : ''} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            ) : (
              <Link to={item.href} className="transition-colors hover:text-amazon-blue">
                {item.label}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
