import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  buildMenuIndex,
  fetchLiveMenuData,
  formatPriceTL,
  getInitialMenuData,
  persistMenuDataToServer,
  readStoredAuth,
  recomputeMenuData,
  slugify,
} from '../services/menuRepository';

const MenuContext = createContext(null);
const SYNC_CHANNEL = 'the-food-lounge-menu-sync';

export function MenuProvider({ children }) {
  const [menuData, setMenuData] = useState(() => getInitialMenuData());
  const [isReady, setIsReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [persistenceMode, setPersistenceMode] = useState('file');

  const menuDataRef = useRef(menuData);
  menuDataRef.current = menuData;

  const channelRef = useRef(null);

  // Sync live data from server (/api/menu -> menu_data.json) on mount
  const refreshMenu = useCallback(async () => {
    try {
      const live = await fetchLiveMenuData();
      setMenuData(live);
    } catch {
      // keep initial/cached data silently if running statically
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    refreshMenu();

    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(SYNC_CHANNEL);
      channelRef.current = ch;
      ch.onmessage = (event) => {
        if (event.data?.type === 'MENU_UPDATED' && event.data.payload) {
          setMenuData(recomputeMenuData(event.data.payload));
        }
      };
      return () => {
        ch.close();
        channelRef.current = null;
      };
    }
  }, [refreshMenu]);

  const commitChange = useCallback(async (updater) => {
    const prev = menuDataRef.current;
    const draft = recomputeMenuData(updater(prev));

    // Optimistic immediate UI update (zero lag)
    setMenuData(draft);
    setSaving(true);

    const auth = readStoredAuth();
    const res = await persistMenuDataToServer(draft, auth?.token);
    setSaving(false);

    if (res.unauthorized) {
      setMenuData(prev);
      return { ok: false, unauthorized: true };
    }

    const finalData = res.data || draft;
    setMenuData(finalData);
    setLastSavedAt(res.savedAt);
    setPersistenceMode(res.mode);

    // Notify any other open customer QR menu tabs in real time
    try {
      channelRef.current?.postMessage({
        type: 'MENU_UPDATED',
        payload: finalData,
      });
    } catch {
      // ignore
    }

    return { ok: true, mode: res.mode, savedAt: res.savedAt };
  }, []);

  // --- Product CRUD ---
  const updateItem = useCallback(
    (itemId, patch) =>
      commitChange((prev) => {
        const categoriesMap = new Map(prev.categories.map((c) => [c.id, c]));
        const nextItems = prev.items.map((item) => {
          if (item.id !== itemId) return item;
          const nextCategoryId = patch.categoryId ?? item.categoryId;
          const catObj = categoriesMap.get(nextCategoryId);
          const nextPrice =
            patch.price !== undefined
              ? Number(patch.price)
              : item.price;

          return {
            ...item,
            ...patch,
            categoryId: nextCategoryId,
            category: catObj ? catObj.name : patch.category ?? item.category,
            price: Number.isNaN(nextPrice) ? item.price : nextPrice,
            priceFormatted: Number.isNaN(nextPrice)
              ? item.priceFormatted
              : formatPriceTL(nextPrice),
          };
        });
        return { ...prev, items: nextItems };
      }),
    [commitChange]
  );

  const addItem = useCallback(
    (newItemInput) =>
      commitChange((prev) => {
        const catObj = prev.categories.find((c) => c.id === newItemInput.categoryId);
        const numericPrice = Number(newItemInput.price);
        const uniqueId = `tfl-${Date.now().toString(36)}`;

        const item = {
          id: uniqueId,
          title: String(newItemInput.title || '').trim(),
          category: catObj ? catObj.name : String(newItemInput.category || ''),
          categoryId: newItemInput.categoryId,
          subcategory: newItemInput.subcategory?.trim() || null,
          price: Number.isNaN(numericPrice) ? 0 : numericPrice,
          priceFormatted: formatPriceTL(Number.isNaN(numericPrice) ? 0 : numericPrice),
          description: String(newItemInput.description || '').trim(),
          calories: newItemInput.calories?.trim() || null,
          image: newItemInput.image?.trim() || null,
          dietary: Array.isArray(newItemInput.dietary) ? newItemInput.dietary : [],
          active: newItemInput.active !== false,
        };

        return {
          ...prev,
          items: [item, ...prev.items],
        };
      }),
    [commitChange]
  );

  const deleteItem = useCallback(
    (itemId) =>
      commitChange((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      })),
    [commitChange]
  );

  const toggleItemActive = useCallback(
    (itemId) =>
      commitChange((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, active: i.active === false } : i
        ),
      })),
    [commitChange]
  );

  // --- Category CRUD ---
  const addCategory = useCallback(
    ({ name, image = null, subcategories = [] }) =>
      commitChange((prev) => {
        const cleanName = String(name || '').trim();
        const id = `cat-${Date.now().toString(36)}`;
        const newCat = {
          id,
          name: cleanName,
          slug: slugify(cleanName) || id,
          image: image?.trim() || null,
          itemCount: 0,
          subcategories: subcategories
            .map((s) => s.trim())
            .filter(Boolean),
        };
        return {
          ...prev,
          categories: [...prev.categories, newCat],
        };
      }),
    [commitChange]
  );

  const updateCategory = useCallback(
    (categoryId, patch) =>
      commitChange((prev) => {
        const cleanName = patch.name !== undefined ? String(patch.name).trim() : undefined;
        const nextCategories = prev.categories.map((cat) => {
          if (cat.id !== categoryId) return cat;
          const nextName = cleanName || cat.name;
          return {
            ...cat,
            name: nextName,
            slug: slugify(nextName) || cat.slug,
            image: patch.image !== undefined ? patch.image?.trim() || null : cat.image,
            subcategories:
              patch.subcategories !== undefined
                ? patch.subcategories.map((s) => s.trim()).filter(Boolean)
                : cat.subcategories,
          };
        });

        // Keep product category labels synchronized when a category is renamed
        const nextItems = cleanName
          ? prev.items.map((item) =>
              item.categoryId === categoryId ? { ...item, category: cleanName } : item
            )
          : prev.items;

        return {
          ...prev,
          categories: nextCategories,
          items: nextItems,
        };
      }),
    [commitChange]
  );

  const deleteCategory = useCallback(
    (categoryId, { reassignToCategoryId = null } = {}) =>
      commitChange((prev) => {
        const targetCat = reassignToCategoryId
          ? prev.categories.find((c) => c.id === reassignToCategoryId)
          : null;

        const nextCategories = prev.categories.filter((c) => c.id !== categoryId);
        const nextItems = targetCat
          ? prev.items.map((item) =>
              item.categoryId === categoryId
                ? {
                    ...item,
                    categoryId: targetCat.id,
                    category: targetCat.name,
                    subcategory: null,
                  }
                : item
            )
          : prev.items.filter((item) => item.categoryId !== categoryId);

        return {
          ...prev,
          categories: nextCategories,
          items: nextItems,
        };
      }),
    [commitChange]
  );

  const index = useMemo(() => buildMenuIndex(menuData), [menuData]);

  const value = useMemo(
    () => ({
      menuData,
      index,
      isReady,
      saving,
      lastSavedAt,
      persistenceMode,
      refreshMenu,
      updateItem,
      addItem,
      deleteItem,
      toggleItemActive,
      addCategory,
      updateCategory,
      deleteCategory,
    }),
    [
      menuData,
      index,
      isReady,
      saving,
      lastSavedAt,
      persistenceMode,
      refreshMenu,
      updateItem,
      addItem,
      deleteItem,
      toggleItemActive,
      addCategory,
      updateCategory,
      deleteCategory,
    ]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used inside MenuProvider');
  return ctx;
}
