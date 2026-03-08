import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, Menu, X, User, ShoppingCart } from 'lucide-react';
import { useAuth, useLogout } from '@/hooks/use-auth';

export const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : '/products');
  };

  return (
    <header className="sticky top-0 z-30">
      {/* Promo bar */}
      <div className="bg-amazon text-center text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <p className="flex-1 text-center">
            Free shipping on orders over $50{' '}
            <span className="mx-1 text-white/50">|</span>{' '}
            <Link to="/products" className="underline underline-offset-2 hover:text-amazon-yellow">Shop Now</Link>
          </p>
        </div>
      </div>

      {/* Nav */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 lg:gap-8 lg:px-6">
          <Link to="/" className="shrink-0" aria-label="Home">
            <span className="text-xl font-bold tracking-tight text-amazon">amazon<span className="text-amazon-orange">.</span></span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex lg:gap-7" aria-label="Main navigation">
            <Link to="/products" className="flex items-center gap-1 whitespace-nowrap text-sm text-gray-700 transition-colors hover:text-amazon">Categories <ChevronDown className="h-3.5 w-3.5 text-gray-400" /></Link>
            <Link to="/products?sortBy=price_asc" className="whitespace-nowrap text-sm text-gray-700 hover:text-amazon">Deals</Link>
            <Link to="/products?sortBy=newest" className="whitespace-nowrap text-sm text-gray-700 hover:text-amazon">What&apos;s New</Link>
            <Link to="/products" className="whitespace-nowrap text-sm text-gray-700 hover:text-amazon">Delivery</Link>
          </nav>

          <div className="flex-1" />

          <form onSubmit={handleSearch} className="hidden items-center sm:flex" role="search">
            <label htmlFor="cs-search" className="sr-only">Search</label>
            <div className="flex w-40 items-center rounded-full border border-gray-300 md:w-44 lg:w-52">
              <input id="cs-search" type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Product" className="w-full border-0 bg-transparent py-1.5 pl-4 pr-1 text-sm placeholder-gray-400 focus:outline-none" />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="shrink-0 p-1 text-gray-400 hover:text-gray-600" aria-label="Clear search"><X className="h-3.5 w-3.5" /></button>
              )}
              <button type="submit" className="shrink-0 px-3 text-gray-500 hover:text-amazon" aria-label="Search"><Search className="h-4 w-4" strokeWidth={2} /></button>
            </div>
          </form>

          {isAuthenticated ? (
            <button type="button" onClick={() => logoutMutation.mutate()} className="hidden items-center gap-1.5 text-sm text-gray-700 hover:text-amazon sm:flex" aria-label={`Account — ${user?.name}`}>
              <User className="h-4 w-4" strokeWidth={1.5} /> Account
            </button>
          ) : (
            <Link to="/login" className="hidden items-center gap-1.5 text-sm text-gray-700 hover:text-amazon sm:flex"><User className="h-4 w-4" strokeWidth={1.5} /> Account</Link>
          )}

          <Link to="/products" className="hidden items-center gap-1.5 text-sm text-gray-700 hover:text-amazon sm:flex"><ShoppingCart className="h-4 w-4" strokeWidth={1.5} /> Cart</Link>

          <button type="button" className="p-1 text-gray-700 hover:bg-gray-100 md:hidden" aria-label="Menu" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-3 md:hidden">
            <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} className="mb-3 sm:hidden" role="search">
              <label htmlFor="mobile-search" className="sr-only">Search</label>
              <div className="flex items-center rounded-lg bg-gray-100">
                <Search className="ml-3 h-4 w-4 text-gray-400" />
                <input id="mobile-search" type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full bg-transparent px-2 py-2.5 text-sm placeholder-gray-400 focus:outline-none" />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="shrink-0 pr-3 text-gray-400 hover:text-gray-600" aria-label="Clear search"><X className="h-4 w-4" /></button>
                )}
              </div>
            </form>
            <nav className="flex flex-col gap-1">
              <Link to="/products" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">Categories</Link>
              <Link to="/products?sortBy=price_asc" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">Deals</Link>
              <Link to="/products?sortBy=newest" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">What&apos;s New</Link>
              <Link to="/products" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">Delivery</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
