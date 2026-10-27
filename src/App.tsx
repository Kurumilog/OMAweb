import React, { useState } from 'react';
import { Header } from './components/Header';
import { SidebarCatalog } from './components/SidebarCatalog';
import { CatalogSection } from './components/CatalogSection';
import { ProductPage } from './components/ProductPage';
import { MasterPage } from './components/MasterPage';
import { ProfilePanel } from './components/ProfilePanel';
import { CartDrawer } from './components/CartDrawer';
import { FloatingCartButton } from './components/FloatingCartButton';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { Product } from './types';

type View = 'catalog' | 'product' | 'master';

export const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [masterProducts, setMasterProducts] = useState<Product[] | undefined>();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleGoHome = () => {
    setActiveView('catalog');
    setSelectedCategory('all');
    setSearchQuery('');
    setActiveProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (activeView !== 'catalog') setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openMaster = (products?: Product[]) => {
    setMasterProducts(products);
    setActiveView('master');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProduct = (product: Product) => {
    setActiveProduct(product);
    setActiveView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCatalog = () => {
    if (activeView !== 'catalog') {
      setActiveView('catalog');
      window.setTimeout(() => {
        const el = document.getElementById('catalog-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-oma-bg text-oma-text">
      <Header
        onSearch={handleSearch}
        onGoHome={handleGoHome}
        activeView={activeView}
        onOpenMaster={() => openMaster()}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {activeView === 'master' ? (
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 py-6">
          <MasterPage
            initialProducts={masterProducts}
            onBackToCatalog={handleGoHome}
            onOpenProduct={openProduct}
          />
        </main>
      ) : activeView === 'product' && activeProduct ? (
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 py-6">
          <ProductPage
            product={activeProduct}
            onBack={handleGoHome}
            onSelectProduct={openProduct}
            onStartMasterFlow={(product) => openMaster([product])}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 items-start">
          <SidebarCatalog
            selectedCategory={selectedCategory}
            activeView={activeView}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenMaster={() => openMaster()}
          />

          <div className="flex-1 min-w-0 w-full">
            <CatalogSection
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSelectProduct={openProduct}
            />
          </div>
        </main>
      )}

      <CartDrawer onOpenMaster={openMaster} />
      <FloatingCartButton onGoToMaster={() => openMaster()} />
      <MobileBottomNav
        onGoHome={handleGoHome}
        onScrollToCatalog={scrollToCatalog}
        onOpenMaster={() => openMaster()}
        onOpenProfile={() => setProfileOpen(true)}
        activeView={activeView}
      />
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <UserProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </UserProvider>
  );
};

export default App;
