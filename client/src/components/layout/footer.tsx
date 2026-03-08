import { Link } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export const Footer = () => (
  <footer className="mt-8">
    <button type="button" onClick={scrollToTop} className="flex w-full items-center justify-center gap-1.5 bg-amazon-light py-3 text-sm text-white transition-colors hover:bg-amazon">
      <ChevronUp className="h-4 w-4" strokeWidth={2} />
      Back to top
    </button>

    <div className="bg-amazon py-12 text-white/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
        <div>
          <h3 className="mb-4 text-sm font-bold text-white">Get to Know Us</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-white">About Us</Link></li>
            <li><Link to="/" className="hover:text-white">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-white">Shop With Us</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/products" className="hover:text-white">All Products</Link></li>
            <li><Link to="/" className="hover:text-white">Today&apos;s Deals</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-white">Help</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-white">Your Account</Link></li>
            <li><Link to="/" className="hover:text-white">Returns</Link></li>
            <li><Link to="/" className="hover:text-white">Support</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-white">Connect</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-white">Sell With Us</Link></li>
            <li><Link to="/" className="hover:text-white">Advertise</Link></li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-amazon-blue-dark py-4 text-center text-xs text-white/40">
      Amazon Clone &mdash; Demo Project
    </div>
  </footer>
);
