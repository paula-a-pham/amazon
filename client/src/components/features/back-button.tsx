import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type BackButtonProps = {
  fallbackPath: string;
};

export const BackButton = ({ fallbackPath }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
      Back
    </button>
  );
};
