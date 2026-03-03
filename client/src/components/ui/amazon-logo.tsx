type AmazonLogoProps = {
  className?: string;
};

export const AmazonLogo = ({ className = '' }: AmazonLogoProps) => (
  <span className={`text-2xl font-bold tracking-tight text-amazon ${className}`} aria-label="Amazon">
    amazon<span className="text-amazon-orange">.</span>
  </span>
);
