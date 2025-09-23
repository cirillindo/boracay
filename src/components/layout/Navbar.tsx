// src/components/layout/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../ui/Container'; // Corrected path
import Button from '../ui/Button'; // Corrected path
import { Lock, Menu, X, Heart, CreditCard, ChevronDown, Tag, ShoppingCart } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Corrected path
import { useShoppingCart } from '../../context/ShoppingCartContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasFavorites, setHasFavorites] = useState(false);
  const [isPulsating, setIsPulsating] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesDropdownOpen, setMobileServicesDropdownOpen] = useState(false);
  const { getTotalItems } = useShoppingCart();
  const cartItemCount = getTotalItems();
  
  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: 'FOR SALE', href: '/for-sale' },
    { name: 'RENTAL', href: '/airbnb' },
    { name: 'BOOK DIRECT', href: '/direct' },
    { 
      name: 'SERVICES', 
      href: '#',
      dropdown: [
        { name: 'PROPERTY SERVICES', href: '/services' },
        { name: 'RENTAL MANAGEMENT', href: '/vacation-rental-management' },
        { name: 'DREAM MOVE CALCULATOR', href: '/dream-move-calculator' }
      ]
    },
    { name: 'ABOUT US', href: '/about' },
    { name: 'BLOG', href: '/blog' },
    { name: 'CONTACT', href: '/contact' }
  ];

  useEffect(() => {
    const checkFavorites = () => {
      const favoritesStr = localStorage.getItem('favorites');
      const favorites = favoritesStr ? JSON.parse(favoritesStr) : [];
      setHasFavorites(favorites.length > 0);
    };

    checkFavorites();

    const handleFavoriteChange = () => {
      checkFavorites();
      setIsPulsating(true);
      setTimeout(() => setIsPulsating(false), 500);
    };

    window.addEventListener('favoritesUpdated', handleFavoriteChange);
    return () => window.removeEventListener('favoritesUpdated', handleFavoriteChange);
  }, []);

  const handleNavClick = () => {
    setIsMenuOpen(false);
    setServicesDropdownOpen(false);
    setMobileServicesDropdownOpen(false);
    window.scrollTo(0, 0);
  };

  const toggleServicesDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setServicesDropdownOpen(!servicesDropdownOpen);
  };

  const toggleMobileServicesDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileServicesDropdownOpen(!mobileServicesDropdownOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white">
      <Container>
        <div className="flex items-center justify-between h-32">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3" onClick={handleNavClick}>
              <img 
                src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1747138852/logo_Ilaw_ilaw_on7nwc.avif"
                alt="Ilaw Logo"
                className="h-32 w-auto"
              />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.dropdown ? (
                <div key={link.name} className="relative group">
                  <button
                    onClick={toggleServicesDropdown}
                    className="text-sm font-medium tracking-wide text-gray-700 hover:text-amber-600 transition-colors flex items-center gap-1"
                  >
                    {link.name}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {servicesDropdownOpen && (
                    <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 mt-1 min-w-[240px] z-50">
                      {link.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          to={dropdownItem.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 whitespace-nowrap"
                          onClick={handleNavClick}
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium tracking-wide text-gray-700 hover:text-amber-600 transition-colors"
                  onClick={handleNavClick}
                >
                  {link.name}
                </Link>
              )
            ))}
            <Link
              to="/favorites"
              className="text-sm font-medium tracking-wide text-gray-700 hover:text-amber-600 transition-colors flex items-center gap-2"
              onClick={handleNavClick}
            >
              <div className={hasFavorites ? 'heart-radar' : ''}>
                <Heart 
                  className={`w-5 h-5 ${isPulsating ? 'heart-pulse' : ''} ${hasFavorites ? 'fill-red-500 text-red-500' : ''}`}
                />
              </div>
              <span className="sr-only">Favorites</span>
            </Link>
            <Link
              to="/cart"
              className="text-sm font-medium tracking-wide text-gray-700 hover:text-amber-600 transition-colors flex items-center gap-2 relative"
              onClick={handleNavClick}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </div>
              <span className="sr-only">Shopping Cart</span>
            </Link>
            <Link
              to="/promos"
              className="text-sm font-medium tracking-wide text-gray-700 hover:text-amber-600 transition-colors flex items-center gap-2"
              onClick={handleNavClick}
            >
              <Tag className="w-5 h-5" />
              <span>PROMOS</span>
            </Link>
            <Button
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/admin/login');
              }}
              variant="outline"
              className="flex items-center gap-2 text-sm"
            >
              <Lock className="w-5 h-5" />
              Admin
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-32 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                link.dropdown ? (
                  <div key={link.name} className="space-y-2">
                    <button
                      onClick={toggleMobileServicesDropdown}
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors py-2"
                    >
                      <span>{link.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileServicesDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {mobileServicesDropdownOpen && (
                      <div className="pl-4 space-y-2 border-l-2 border-amber-100">
                        {link.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className="block text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors py-2"
                            onClick={handleNavClick}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="block text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors py-2"
                    onClick={handleNavClick}
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <Link
                to="/promos"
                className="block text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors py-2 flex items-center gap-2"
                onClick={handleNavClick}
              >
                <Tag className="w-5 h-5" />
                PROMOS
              </Link>
              <Link
                to="/favorites"
                className="block text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors py-2 flex items-center gap-2"
                onClick={handleNavClick}
              >
                <div className={hasFavorites ? 'heart-radar' : ''}>
                  <Heart 
                    className={`w-5 h-5 ${isPulsating ? 'heart-pulse' : ''} ${hasFavorites ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </div>
                FAVORITES
              </Link>
              <Link
                to="/cart"
                className="block text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors py-2 flex items-center gap-2"
                onClick={handleNavClick}
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </div>
                CART
              </Link>
              <Button
                onClick={() => {
                  handleNavClick();
                  navigate('/admin/login');
                }}
                variant="outline"
                className="flex items-center gap-2 w-full text-sm"
              >
                <Lock className="w-5 h-5" />
                Admin
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Navbar;
