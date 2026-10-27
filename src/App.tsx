import React, { useState } from 'react';
import { Header } from './components/Header';
import { SidebarCatalog } from './components/SidebarCatalog';
import { CatalogSection } from './components/CatalogSection';
import { HomePage } from './components/HomePage';
import { TaskPage } from './components/TaskPage';
import { ProductPage } from './components/ProductPage';
import { MasterPage } from './components/MasterPage';
import { ProfilePanel } from './components/ProfilePanel';
import { CartDrawer } from './components/CartDrawer';
import { FloatingCartButton } from './components/FloatingCartButton';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { CartProvider, useCart } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { Product, Task } from './types';
import tasksData from './data/tasks.json';

const allTasks = tasksData as Task[];

export type View =
  | 'home'
  | 'catalog'
  | 'product'
  | 'master'
  | 'service'
  | 'application'
  | 'order-cabinet'
  | 'cart'
  | 'loyalty'
  | 'task';

export const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(allTasks[0]);
  const [masterProducts, setMasterProducts] = useState<Product[] | undefined>();
  const [profileOpen, setProfileOpen] = useState(false);
  const { setIsCartOpen } = useCart();

  // Состояние фильтрации для каталога
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [onlyWithInstallation, setOnlyWithInstallation] = useState<boolean>(false);

  const handleGoHome = () => {
    setActiveView('home');
    setSelectedCategory('all');
    setSearchQuery('');
    setActiveProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoCatalog = () => {
    setActiveView('catalog');
    setActiveProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchTask = (query: string) => {
    const qLower = query.toLowerCase();
    const foundTask = allTasks.find(
      (t) => t.title.toLowerCase().includes(qLower) || t.description.toLowerCase().includes(qLower)
    );
    if (foundTask) {
      setActiveTask(foundTask);
      setActiveView('task');
    } else {
      handleSearch(query);
    }
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

  const openTask = (task: Task) => {
    setActiveTask(task);
    setActiveView('task');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const openLoyalty = () => {
    setProfileOpen(true);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const resetAllFilters = () => {
    setMaxPrice(undefined);
    setSelectedBrands([]);
    setOnlyWithInstallation(false);
    setSearchQuery('');
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
    <div className="min-h-screen flex flex-col bg-[#F4F4F6] text-[#111111]">
      <Header
        onSearch={handleSearch}
        onGoHome={handleGoHome}
        onGoCatalog={handleGoCatalog}
        activeView={activeView}
        onOpenMaster={() => openMaster()}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenLoyalty={openLoyalty}
        onOpenCart={openCart}
      />

      {activeView === 'master' ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-10 py-8">
          <MasterPage
            initialProducts={masterProducts}
            onBackToCatalog={handleGoHome}
            onOpenProduct={openProduct}
          />
        </main>
      ) : activeView === 'product' && activeProduct ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-10 py-8">
          <ProductPage
            product={activeProduct}
            onBack={handleGoHome}
            onSelectProduct={openProduct}
            onStartMasterFlow={(product) => openMaster([product])}
          />
        </main>
      ) : activeView === 'task' && activeTask ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-10 py-8">
          <TaskPage
            task={activeTask}
            onBack={handleGoHome}
            onSelectProduct={openProduct}
          />
        </main>
      ) : activeView === 'home' ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-10 py-8 flex flex-col lg:flex-row gap-6 items-start">
          <SidebarCatalog
            selectedCategory={selectedCategory}
            activeView="home"
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setActiveView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenMaster={() => openMaster()}
          />

          <div className="flex-1 min-w-0 w-full">
            <HomePage
              onSelectProduct={openProduct}
              onSelectTask={openTask}
              onGoToCatalog={handleGoCatalog}
              onSearchTask={handleSearchTask}
            />
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-10 py-8 flex flex-col lg:flex-row gap-6 items-start">
          <SidebarCatalog
            selectedCategory={selectedCategory}
            activeView="catalog"
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenMaster={() => openMaster()}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            selectedBrands={selectedBrands}
            onToggleBrand={toggleBrand}
            onlyWithInstallation={onlyWithInstallation}
            onToggleOnlyInstallation={() => setOnlyWithInstallation(!onlyWithInstallation)}
          />

          <div className="flex-1 min-w-0 w-full">
            <CatalogSection
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSelectProduct={openProduct}
              maxPrice={maxPrice}
              onClearMaxPrice={() => setMaxPrice(undefined)}
              selectedBrands={selectedBrands}
              onRemoveBrand={(b) => toggleBrand(b)}
              onlyWithInstallation={onlyWithInstallation}
              onToggleOnlyInstallation={() => setOnlyWithInstallation(!onlyWithInstallation)}
              onResetAllFilters={resetAllFilters}
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
        activeView={activeView === 'master' ? 'master' : 'catalog'}
      />
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
      <Footer
        onGoHome={handleGoHome}
        onGoCatalog={handleGoCatalog}
        onOpenMaster={() => openMaster()}
        onOpenLoyalty={openLoyalty}
      />
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
