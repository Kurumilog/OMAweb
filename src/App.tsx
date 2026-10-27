import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SidebarCatalog } from './components/SidebarCatalog';
import { CatalogSection } from './components/CatalogSection';
import { HomePage } from './components/HomePage';
import { TaskPage } from './components/TaskPage';
import { ProductPage } from './components/ProductPage';
import { MasterPage } from './components/MasterPage';
import { MasterLandingPage } from './components/MasterLandingPage';
import { ServicePage } from './components/ServicePage';
import { MasterApplicationPage, ApplicationOrderData } from './components/MasterApplicationPage';
import { OrderCabinetPage, CabinetOrder } from './components/OrderCabinetPage';
import { LoyaltyPage } from './components/LoyaltyPage';
import { CartPage } from './components/CartPage';
import { ProfilePanel } from './components/ProfilePanel';
import { CartDrawer } from './components/CartDrawer';
import { FloatingCartButton } from './components/FloatingCartButton';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { CartProvider, useCart } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { Product, Task, Service } from './types';
import { SHUFFLED_PRODUCTS } from './utils/catalog';
import tasksData from './data/tasks.json';
import servicesData from './data/services.json';

const allProducts = SHUFFLED_PRODUCTS;
const allTasks = tasksData as Task[];
const allServices = servicesData as Service[];

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

interface HistoryRouteState {
  view: View;
  category?: string;
  search?: string;
  productId?: string | null;
  taskId?: string | null;
  serviceId?: string | null;
}

function parseRouteFromUrl(): HistoryRouteState {
  const params = new URLSearchParams(window.location.search);
  const viewParam = (params.get('view') as View) || 'home';
  const category = params.get('category') || 'all';
  const search = params.get('q') || '';
  const productId = params.get('product') || null;
  const taskId = params.get('task') || null;
  const serviceId = params.get('service') || null;

  return {
    view: viewParam,
    category,
    search,
    productId,
    taskId,
    serviceId,
  };
}

function buildUrlFromState(state: HistoryRouteState): string {
  const params = new URLSearchParams();
  if (state.view && state.view !== 'home') {
    params.set('view', state.view);
  }
  if (state.view === 'catalog' && state.category && state.category !== 'all') {
    params.set('category', state.category);
  }
  if (state.view === 'catalog' && state.search) {
    params.set('q', state.search);
  }
  if (state.view === 'product' && state.productId) {
    params.set('product', state.productId);
  }
  if (state.view === 'task' && state.taskId) {
    params.set('task', state.taskId);
  }
  if (state.view === 'service' && state.serviceId) {
    params.set('service', state.serviceId);
  }
  const qs = params.toString();
  return `${window.location.pathname}${qs ? `?${qs}` : ''}`;
}

export const AppContent: React.FC = () => {
  const initialRoute = useRef<HistoryRouteState>(parseRouteFromUrl()).current;

  const [activeView, setActiveView] = useState<View>(() => {
    if (initialRoute.view === 'product' && initialRoute.productId) {
      const found = allProducts.find((p) => p.id === initialRoute.productId);
      if (found) return 'product';
      return 'catalog';
    }
    return initialRoute.view;
  });
  const [searchQuery, setSearchQuery] = useState(initialRoute.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialRoute.category || 'all');
  const [activeProduct, setActiveProduct] = useState<Product | null>(() => {
    if (initialRoute.productId) {
      return allProducts.find((p) => p.id === initialRoute.productId) || null;
    }
    return null;
  });
  const [activeTask, setActiveTask] = useState<Task | null>(() => {
    if (initialRoute.taskId) {
      return allTasks.find((t) => t.id === initialRoute.taskId) || allTasks[0];
    }
    return allTasks[0];
  });
  const [masterProducts, setMasterProducts] = useState<Product[] | undefined>();
  const [selectedService, setSelectedService] = useState<Service>(() => {
    if (initialRoute.serviceId) {
      return allServices.find((s) => s.id === initialRoute.serviceId) || allServices[0];
    }
    return allServices[0];
  });
  const [applicationProductSource, setApplicationProductSource] = useState<'oma' | 'own'>('oma');
  const [currentCabinetOrder, setCurrentCabinetOrder] = useState<CabinetOrder | undefined>();
  const [profileOpen, setProfileOpen] = useState(false);
  const { setIsCartOpen } = useCart();

  // Состояние фильтрации для каталога
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [onlyWithInstallation, setOnlyWithInstallation] = useState<boolean>(false);
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Поддержка кнопок Назад / Вперёд в Safari и других браузерах через History API
  const isPopStateNavigation = useRef(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const initialState: HistoryRouteState = {
      view: activeView,
      category: selectedCategory,
      search: searchQuery,
      productId: activeProduct?.id || null,
      taskId: activeTask?.id || null,
      serviceId: selectedService?.id || null,
    };
    window.history.replaceState(initialState, '', buildUrlFromState(initialState));

    const handlePopState = (event: PopStateEvent) => {
      isPopStateNavigation.current = true;
      const state: HistoryRouteState = event.state || parseRouteFromUrl();

      setSelectedCategory(state.category || 'all');
      setSearchQuery(state.search || '');

      if (state.productId) {
        const foundProduct = allProducts.find((p) => p.id === state.productId) || null;
        setActiveProduct(foundProduct);
      } else if (state.view !== 'application') {
        setActiveProduct(null);
      }

      if (state.taskId) {
        const foundTask = allTasks.find((t) => t.id === state.taskId) || allTasks[0];
        setActiveTask(foundTask);
      }

      if (state.serviceId) {
        const foundService = allServices.find((s) => s.id === state.serviceId) || allServices[0];
        setSelectedService(foundService);
      }

      setActiveView(state.view || 'home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isPopStateNavigation.current) {
      isPopStateNavigation.current = false;
      return;
    }

    const nextState: HistoryRouteState = {
      view: activeView,
      category: selectedCategory,
      search: searchQuery,
      productId: activeProduct?.id || null,
      taskId: activeTask?.id || null,
      serviceId: selectedService?.id || null,
    };
    const nextUrl = buildUrlFromState(nextState);
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      window.history.pushState(nextState, '', nextUrl);
    }
  }, [activeView, selectedCategory, searchQuery, activeProduct?.id, activeTask?.id, selectedService?.id]);

  const handleGoHome = () => {
    setActiveView('home');
    setSelectedCategory('all');
    setSearchQuery('');
    setOnlyFavorites(false);
    setActiveProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoCatalog = () => {
    setActiveView('catalog');
    setOnlyFavorites(false);
    setActiveProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowFavoritesInCatalog = () => {
    setSelectedCategory('all');
    setOnlyFavorites(true);
    setActiveProduct(null);
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setOnlyFavorites(false);
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
    setActiveView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLoyalty = () => {
    setActiveView('loyalty');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setOnlyFavorites(false);
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
        onSelectProduct={openProduct}
        onShowFavoritesInCatalog={handleShowFavoritesInCatalog}
      />

      {activeView === 'master' ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
          <MasterLandingPage
            onSelectService={(svc) => {
              setSelectedService(svc);
              setActiveView('service');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenOrderCabinet={() => {
              setActiveView('order-cabinet');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartApplication={(svc) => {
              if (svc) setSelectedService(svc);
              setActiveView('application');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      ) : activeView === 'service' ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
          <ServicePage
            service={selectedService || allServices[0]}
            onBack={() => {
              setActiveView('master');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectProduct={openProduct}
            onGoToCatalog={handleGoCatalog}
            onStartApplication={(svc, src) => {
              setSelectedService(svc);
              setApplicationProductSource(src);
              setActiveView('application');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      ) : activeView === 'application' ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
          <MasterApplicationPage
            initialService={selectedService}
            initialProduct={activeProduct}
            productSource={applicationProductSource}
            onBack={() => {
              setActiveView('master');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCompleteOrder={(orderData: ApplicationOrderData) => {
              const newOrder: CabinetOrder = {
                id: 'ord_' + Math.floor(10000 + Math.random() * 90000),
                orderNumber: String(Math.floor(10000 + Math.random() * 90000)),
                status: 'on_the_way',
                serviceTitle: orderData.service.title,
                productName: orderData.productName,
                address: `${orderData.address.city}, ${orderData.address.street}, д. ${orderData.address.house}, кв. ${orderData.address.apt}`,
                dateTime: `${orderData.date} · ${orderData.timeSlot}`,
                goodsPrice: activeProduct ? activeProduct.price : 0,
                servicePrice: orderData.service.price * orderData.quantity,
                deliveryPrice: 8.0,
                discountBonus: orderData.useBonuses,
                totalPrice: orderData.totalPrice,
                earnedBonuses: Math.round(orderData.totalPrice * 0.08),
                master: {
                  name: 'Алексей С.',
                  avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
                  rating: 4.9,
                  completedOrders: 248,
                  phone: '+375 (29) 765-43-21',
                },
              };
              setCurrentCabinetOrder(newOrder);
              setActiveView('order-cabinet');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      ) : activeView === 'order-cabinet' ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
          <OrderCabinetPage
            order={currentCabinetOrder}
            onBackToHome={handleGoHome}
            onGoToCatalog={handleGoCatalog}
            onOpenLoyalty={openLoyalty}
          />
        </main>
      ) : activeView === 'loyalty' ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
          <LoyaltyPage
            onGoToCatalog={handleGoCatalog}
            onOpenMaster={() => openMaster()}
          />
        </main>
      ) : activeView === 'cart' ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
          <CartPage
            onBackToCatalog={handleGoCatalog}
            onProceedToOrder={() => {
              setActiveView('application');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectProduct={openProduct}
          />
        </main>
      ) : activeView === 'product' && activeProduct ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
          <ProductPage
            product={activeProduct}
            onBack={handleGoHome}
            onGoToCatalog={(category) => {
              if (category) setSelectedCategory(category);
              setOnlyFavorites(false);
              setActiveProduct(null);
              setActiveView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectProduct={openProduct}
            onStartMasterFlow={(product) => {
              setActiveProduct(product);
              const matchingSvc = allServices.find((s) => s.id === product.serviceId) || allServices[0];
              setSelectedService(matchingSvc);
              setApplicationProductSource('oma');
              setActiveView('application');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      ) : activeView === 'task' && activeTask ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
          <TaskPage
            task={activeTask}
            onBack={handleGoHome}
            onSelectProduct={openProduct}
          />
        </main>
      ) : activeView === 'home' ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8 flex flex-col lg:flex-row gap-6 items-start">
          <SidebarCatalog
            selectedCategory={selectedCategory}
            activeView="home"
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setOnlyFavorites(false);
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
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8 flex flex-col lg:flex-row gap-6 items-start">
          <SidebarCatalog
            selectedCategory={selectedCategory}
            activeView="catalog"
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setOnlyFavorites(false);
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
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                setOnlyFavorites(false);
              }}
              searchQuery={searchQuery}
              onSelectProduct={openProduct}
              maxPrice={maxPrice}
              onClearMaxPrice={() => setMaxPrice(undefined)}
              selectedBrands={selectedBrands}
              onRemoveBrand={(b) => toggleBrand(b)}
              onlyWithInstallation={onlyWithInstallation}
              onToggleOnlyInstallation={() => setOnlyWithInstallation(!onlyWithInstallation)}
              onlyFavorites={onlyFavorites}
              onToggleOnlyFavorites={() => setOnlyFavorites(!onlyFavorites)}
              onResetAllFilters={resetAllFilters}
            />
          </div>
        </main>
      )}

      <CartDrawer onOpenMaster={openMaster} />
      <FloatingCartButton onGoToMaster={() => openMaster()} onOpenCart={openCart} />
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
