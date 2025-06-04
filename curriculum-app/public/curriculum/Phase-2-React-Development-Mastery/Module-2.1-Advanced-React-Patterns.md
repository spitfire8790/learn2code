# Module 2.1: Advanced React Patterns

## Learning Objectives

By the end of this module, you will be able to:

- Implement advanced React patterns for complex property applications
- Master Context API and state management strategies
- Build scalable component architectures
- Create sophisticated form handling systems
- Apply performance optimisation techniques

## Prerequisites

- Completion of Phase 1: Foundation Technologies
- Strong understanding of React hooks and component lifecycle
- Experience with TypeScript and modern JavaScript
- Familiarity with state management concepts

## Introduction

Modern property analysis applications require sophisticated React patterns to handle complex state management, component communication, and user interactions. This module covers advanced React techniques used in professional property development platforms, including the management of property data, user interactions, and complex business logic.

The property analysis platform employs advanced React patterns such as compound components, render props, custom hooks, and context providers to create maintainable and scalable applications that can handle thousands of properties, complex filtering systems, and real-time data updates.

**What makes these patterns "advanced"?**

- **Scalability**: Handle thousands of properties and complex data relationships
- **Maintainability**: Organise code that remains manageable as features grow
- **Performance**: Optimise rendering and state updates for smooth user experience
- **Reusability**: Create components that work across different parts of the application
- **Developer Experience**: Write code that's easier to understand, test, and debug

## Section 1: Advanced State Management with Context

### Property Management Context

The Context API becomes essential when you need to share state across many components without "prop drilling" (passing props through multiple layers). In a property application, you might need property data, user selections, filters, and pagination available throughout your component tree.

**Why use Context for property management?**

- **Global state**: Property data needs to be accessed by lists, cards, filters, and detail views
- **Avoid prop drilling**: Don't pass property data through 5+ component layers
- **Consistent updates**: When a property updates, all related components update automatically
- **Performance**: Only re-render components that actually use the data

**The reducer pattern**: We use `useReducer` instead of `useState` because property management involves complex state transitions. Each action type represents a specific business operation.

Let's build a comprehensive context system for managing property data throughout your application:

```tsx
// src/contexts/PropertyContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import {
  Property,
  PropertyFilters,
  PropertySortOptions,
} from "@/types/property";
import { PropertyService } from "@/services/propertyService";

interface PropertyState {
  properties: Property[];
  selectedProperties: string[];
  filters: PropertyFilters;
  sortOptions: PropertySortOptions | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

type PropertyAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PROPERTIES"; payload: Property[] }
  | { type: "ADD_PROPERTY"; payload: Property }
  | {
      type: "UPDATE_PROPERTY";
      payload: { id: string; updates: Partial<Property> };
    }
  | { type: "DELETE_PROPERTY"; payload: string }
  | { type: "SET_FILTERS"; payload: PropertyFilters }
  | { type: "SET_SORT"; payload: PropertySortOptions | null }
  | { type: "SELECT_PROPERTY"; payload: string }
  | { type: "DESELECT_PROPERTY"; payload: string }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_PAGINATION"; payload: Partial<PropertyState["pagination"]> };

const initialState: PropertyState = {
  properties: [],
  selectedProperties: [],
  filters: {},
  sortOptions: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrev: false,
  },
};

function propertyReducer(
  state: PropertyState,
  action: PropertyAction
): PropertyState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_PROPERTIES":
      return {
        ...state,
        properties: action.payload,
        loading: false,
        error: null,
      };

    case "ADD_PROPERTY":
      return {
        ...state,
        properties: [action.payload, ...state.properties],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };

    case "UPDATE_PROPERTY":
      return {
        ...state,
        properties: state.properties.map((property) =>
          property.id === action.payload.id
            ? { ...property, ...action.payload.updates }
            : property
        ),
      };

    case "DELETE_PROPERTY":
      return {
        ...state,
        properties: state.properties.filter(
          (property) => property.id !== action.payload
        ),
        selectedProperties: state.selectedProperties.filter(
          (id) => id !== action.payload
        ),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };

    case "SET_FILTERS":
      return { ...state, filters: action.payload };

    case "SET_SORT":
      return { ...state, sortOptions: action.payload };

    case "SELECT_PROPERTY":
      return {
        ...state,
        selectedProperties: state.selectedProperties.includes(action.payload)
          ? state.selectedProperties
          : [...state.selectedProperties, action.payload],
      };

    case "DESELECT_PROPERTY":
      return {
        ...state,
        selectedProperties: state.selectedProperties.filter(
          (id) => id !== action.payload
        ),
      };

    case "CLEAR_SELECTION":
      return { ...state, selectedProperties: [] };

    case "SET_PAGINATION":
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };

    default:
      return state;
  }
}

interface PropertyContextValue extends PropertyState {
  fetchProperties: () => Promise<void>;
  createProperty: (
    property: Omit<Property, "id" | "metadata">
  ) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  setFilters: (filters: PropertyFilters) => void;
  setSortOptions: (sort: PropertySortOptions | null) => void;
  selectProperty: (id: string) => void;
  deselectProperty: (id: string) => void;
  clearSelection: () => void;
  goToPage: (page: number) => void;
}

const PropertyContext = createContext<PropertyContextValue | undefined>(
  undefined
);

interface PropertyProviderProps {
  children: React.ReactNode;
  propertyService: PropertyService;
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({
  children,
  propertyService,
}) => {
  const [state, dispatch] = useReducer(propertyReducer, initialState);

  const fetchProperties = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await propertyService.getProperties(
        state.filters,
        state.sortOptions,
        state.pagination.page,
        state.pagination.limit
      );

      if (response.success) {
        dispatch({ type: "SET_PROPERTIES", payload: response.data.data });
        dispatch({
          type: "SET_PAGINATION",
          payload: {
            total: response.data.total,
            hasNext: response.data.hasNext,
            hasPrev: response.data.hasPrev,
          },
        });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: response.message || "Failed to fetch properties",
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }, [
    propertyService,
    state.filters,
    state.sortOptions,
    state.pagination.page,
    state.pagination.limit,
  ]);

  const createProperty = useCallback(
    async (property: Omit<Property, "id" | "metadata">) => {
      try {
        const response = await propertyService.createProperty(property);
        if (response.success) {
          dispatch({ type: "ADD_PROPERTY", payload: response.data });
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: response.message || "Failed to create property",
          });
        }
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error
              ? error.message
              : "Failed to create property",
        });
      }
    },
    [propertyService]
  );

  const updateProperty = useCallback(
    async (id: string, updates: Partial<Property>) => {
      try {
        const response = await propertyService.updateProperty(id, updates);
        if (response.success) {
          dispatch({
            type: "UPDATE_PROPERTY",
            payload: { id, updates: response.data },
          });
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: response.message || "Failed to update property",
          });
        }
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error
              ? error.message
              : "Failed to update property",
        });
      }
    },
    [propertyService]
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      try {
        const response = await propertyService.deleteProperty(id);
        if (response.success) {
          dispatch({ type: "DELETE_PROPERTY", payload: id });
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: response.message || "Failed to delete property",
          });
        }
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error
              ? error.message
              : "Failed to delete property",
        });
      }
    },
    [propertyService]
  );

  const setFilters = useCallback((filters: PropertyFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
    dispatch({ type: "SET_PAGINATION", payload: { page: 1 } }); // Reset to first page
  }, []);

  const setSortOptions = useCallback((sort: PropertySortOptions | null) => {
    dispatch({ type: "SET_SORT", payload: sort });
  }, []);

  const selectProperty = useCallback((id: string) => {
    dispatch({ type: "SELECT_PROPERTY", payload: id });
  }, []);

  const deselectProperty = useCallback((id: string) => {
    dispatch({ type: "DESELECT_PROPERTY", payload: id });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTION" });
  }, []);

  const goToPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGINATION", payload: { page } });
  }, []);

  // Fetch properties when filters, sort, or page changes
  useEffect(() => {
    fetchProperties();
  }, [state.filters, state.sortOptions, state.pagination.page]);

  const contextValue: PropertyContextValue = {
    ...state,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    setFilters,
    setSortOptions,
    selectProperty,
    deselectProperty,
    clearSelection,
    goToPage,
  };

  return (
    <PropertyContext.Provider value={contextValue}>
      {children}
    </PropertyContext.Provider>
  );
};

export const usePropertyContext = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error(
      "usePropertyContext must be used within a PropertyProvider"
    );
  }
  return context;
};
```

**Understanding this Context implementation:**

**State Structure**: The `PropertyState` interface defines all the data our property management system needs:

- `properties`: The actual property data array
- `selectedProperties`: IDs of properties the user has selected
- `filters` and `sortOptions`: Current search/filter criteria
- `loading` and `error`: UI state for user feedback
- `pagination`: Handling large datasets efficiently

**Reducer Pattern**: Instead of multiple `useState` calls, we use `useReducer` because:

- **Complex state transitions**: Property operations involve multiple state changes
- **Predictable updates**: Each action type represents a specific business operation
- **Easier testing**: Pure functions are easier to test than stateful components
- **Better debugging**: Action types make it clear what's happening

**Action Types**: Each action represents a specific user intention:

- `SET_PROPERTIES`: Loading fresh data from the server
- `ADD_PROPERTY`: User creates a new property
- `UPDATE_PROPERTY`: User edits existing property details
- `SELECT_PROPERTY`: User selects properties for bulk operations

**Context Value**: The context provides both state and actions, creating a complete API for property management that any component can use without prop drilling.

**Custom Hook**: The `usePropertyContext` hook provides a clean interface and ensures the context is used correctly. The error handling prevents bugs from using the context outside its provider.

### User Interface State Management

Create a comprehensive UI state management system:

```tsx
// src/contexts/UIContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

interface UIState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  activeModal: string | null;
  notifications: Notification[];
  loading: {
    global: boolean;
    operations: Record<string, boolean>;
  };
  layout: {
    mapVisible: boolean;
    chartsPanelOpen: boolean;
    filtersPanelOpen: boolean;
  };
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

type UIAction =
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR_OPEN"; payload: boolean }
  | { type: "OPEN_MODAL"; payload: string }
  | { type: "CLOSE_MODAL" }
  | {
      type: "ADD_NOTIFICATION";
      payload: Omit<Notification, "id" | "timestamp">;
    }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "CLEAR_NOTIFICATIONS" }
  | { type: "SET_GLOBAL_LOADING"; payload: boolean }
  | {
      type: "SET_OPERATION_LOADING";
      payload: { operation: string; loading: boolean };
    }
  | { type: "TOGGLE_MAP" }
  | { type: "TOGGLE_CHARTS_PANEL" }
  | { type: "TOGGLE_FILTERS_PANEL" }
  | { type: "SET_LAYOUT"; payload: Partial<UIState["layout"]> };

const initialState: UIState = {
  theme: "light",
  sidebarOpen: true,
  activeModal: null,
  notifications: [],
  loading: {
    global: false,
    operations: {},
  },
  layout: {
    mapVisible: true,
    chartsPanelOpen: false,
    filtersPanelOpen: true,
  },
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload };

    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case "SET_SIDEBAR_OPEN":
      return { ...state, sidebarOpen: action.payload };

    case "OPEN_MODAL":
      return { ...state, activeModal: action.payload };

    case "CLOSE_MODAL":
      return { ...state, activeModal: null };

    case "ADD_NOTIFICATION":
      const newNotification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
      };

    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };

    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [] };

    case "SET_GLOBAL_LOADING":
      return {
        ...state,
        loading: { ...state.loading, global: action.payload },
      };

    case "SET_OPERATION_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          operations: {
            ...state.loading.operations,
            [action.payload.operation]: action.payload.loading,
          },
        },
      };

    case "TOGGLE_MAP":
      return {
        ...state,
        layout: { ...state.layout, mapVisible: !state.layout.mapVisible },
      };

    case "TOGGLE_CHARTS_PANEL":
      return {
        ...state,
        layout: {
          ...state.layout,
          chartsPanelOpen: !state.layout.chartsPanelOpen,
        },
      };

    case "TOGGLE_FILTERS_PANEL":
      return {
        ...state,
        layout: {
          ...state.layout,
          filtersPanelOpen: !state.layout.filtersPanelOpen,
        },
      };

    case "SET_LAYOUT":
      return {
        ...state,
        layout: { ...state.layout, ...action.payload },
      };

    default:
      return state;
  }
}

interface UIContextValue extends UIState {
  setTheme: (theme: "light" | "dark") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setOperationLoading: (operation: string, loading: boolean) => void;
  isOperationLoading: (operation: string) => boolean;
  toggleMap: () => void;
  toggleChartsPanel: () => void;
  toggleFiltersPanel: () => void;
  setLayout: (layout: Partial<UIState["layout"]>) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

interface UIProviderProps {
  children: React.ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const setTheme = useCallback((theme: "light" | "dark") => {
    dispatch({ type: "SET_THEME", payload: theme });
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: "SET_SIDEBAR_OPEN", payload: open });
  }, []);

  const openModal = useCallback((modalId: string) => {
    dispatch({ type: "OPEN_MODAL", payload: modalId });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: "CLOSE_MODAL" });
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      dispatch({ type: "ADD_NOTIFICATION", payload: notification });

      // Auto-remove notification if autoClose is enabled
      if (notification.autoClose !== false) {
        const duration = notification.duration || 5000;
        setTimeout(() => {
          dispatch({
            type: "REMOVE_NOTIFICATION",
            payload: notification.id || "",
          });
        }, duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  }, []);

  const setGlobalLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_GLOBAL_LOADING", payload: loading });
  }, []);

  const setOperationLoading = useCallback(
    (operation: string, loading: boolean) => {
      dispatch({
        type: "SET_OPERATION_LOADING",
        payload: { operation, loading },
      });
    },
    []
  );

  const isOperationLoading = useCallback(
    (operation: string): boolean => {
      return state.loading.operations[operation] || false;
    },
    [state.loading.operations]
  );

  const toggleMap = useCallback(() => {
    dispatch({ type: "TOGGLE_MAP" });
  }, []);

  const toggleChartsPanel = useCallback(() => {
    dispatch({ type: "TOGGLE_CHARTS_PANEL" });
  }, []);

  const toggleFiltersPanel = useCallback(() => {
    dispatch({ type: "TOGGLE_FILTERS_PANEL" });
  }, []);

  const setLayout = useCallback((layout: Partial<UIState["layout"]>) => {
    dispatch({ type: "SET_LAYOUT", payload: layout });
  }, []);

  const contextValue: UIContextValue = {
    ...state,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    openModal,
    closeModal,
    addNotification,
    removeNotification,
    clearNotifications,
    setGlobalLoading,
    setOperationLoading,
    isOperationLoading,
    toggleMap,
    toggleChartsPanel,
    toggleFiltersPanel,
    setLayout,
  };

  return (
    <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
  );
};

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUIContext must be used within a UIProvider");
  }
  return context;
};
```

## Section 2: Compound Components Pattern

### Property Card System

Create a flexible property card system using compound components:

```tsx
// src/components/PropertyCard/PropertyCard.tsx

import React, { createContext, useContext, useState } from "react";
import { Property } from "@/types/property";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PropertyCardContextValue {
  property: Property;
  isSelected: boolean;
  onSelect?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onView?: (property: Property) => void;
}

const PropertyCardContext = createContext<PropertyCardContextValue | undefined>(
  undefined
);

const usePropertyCard = () => {
  const context = useContext(PropertyCardContext);
  if (!context) {
    throw new Error("PropertyCard components must be used within PropertyCard");
  }
  return context;
};

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onSelect?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onView?: (property: Property) => void;
  children: React.ReactNode;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> & {
  Header: typeof PropertyCardHeader;
  Image: typeof PropertyCardImage;
  Content: typeof PropertyCardContent;
  Details: typeof PropertyCardDetails;
  Actions: typeof PropertyCardActions;
  Badge: typeof PropertyCardBadge;
} = ({
  property,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onView,
  children,
  className = "",
}) => {
  const contextValue: PropertyCardContextValue = {
    property,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onView,
  };

  return (
    <PropertyCardContext.Provider value={contextValue}>
      <Card
        className={`property-card transition-all duration-200 hover:shadow-lg ${
          isSelected ? "ring-2 ring-blue-500" : ""
        } ${className}`}
      >
        {children}
      </Card>
    </PropertyCardContext.Provider>
  );
};

// Property Card Header Component
interface PropertyCardHeaderProps {
  children?: React.ReactNode;
  showSelection?: boolean;
  className?: string;
}

const PropertyCardHeader: React.FC<PropertyCardHeaderProps> = ({
  children,
  showSelection = false,
  className = "",
}) => {
  const { property, isSelected, onSelect } = usePropertyCard();

  return (
    <div
      className={`flex items-center justify-between p-4 border-b ${className}`}
    >
      <div className="flex items-center space-x-3">
        {showSelection && onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(property)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {property.address.fullAddress}
          </h3>
          <p className="text-sm text-gray-500">
            {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
};

// Property Card Image Component
interface PropertyCardImageProps {
  className?: string;
  fallbackSrc?: string;
}

const PropertyCardImage: React.FC<PropertyCardImageProps> = ({
  className = "",
  fallbackSrc = "/api/placeholder/400/200",
}) => {
  const { property } = usePropertyCard();
  const [imageSrc, setImageSrc] = useState(
    property.images.find((img) => img.isPrimary)?.url ||
      property.images[0]?.url ||
      fallbackSrc
  );

  return (
    <div className={`relative h-48 bg-gray-200 ${className}`}>
      <img
        src={imageSrc}
        alt={`Property at ${property.address.fullAddress}`}
        className="w-full h-full object-cover"
        onError={() => setImageSrc(fallbackSrc)}
      />
      <div className="absolute top-2 right-2">
        <PropertyCardBadge
          variant={property.status === "active" ? "success" : "secondary"}
        >
          {property.status}
        </PropertyCardBadge>
      </div>
    </div>
  );
};

// Property Card Content Component
interface PropertyCardContentProps {
  children: React.ReactNode;
  className?: string;
}

const PropertyCardContent: React.FC<PropertyCardContentProps> = ({
  children,
  className = "",
}) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

// Property Card Details Component
interface PropertyCardDetailsProps {
  showFinancials?: boolean;
  showDimensions?: boolean;
  showFeatures?: boolean;
  className?: string;
}

const PropertyCardDetails: React.FC<PropertyCardDetailsProps> = ({
  showFinancials = true,
  showDimensions = true,
  showFeatures = true,
  className = "",
}) => {
  const { property } = usePropertyCard();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {showFinancials && (
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(property.financials.currentValue)}
          </span>
          <PropertyCardBadge variant="outline">
            {property.planning.zone}
          </PropertyCardBadge>
        </div>
      )}

      {showDimensions && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Land Size:</span>
            <span className="ml-2 font-medium">
              {property.dimensions.landSize} sqm
            </span>
          </div>
          <div>
            <span className="text-gray-500">Building:</span>
            <span className="ml-2 font-medium">
              {property.dimensions.buildingArea} sqm
            </span>
          </div>
        </div>
      )}

      {showFeatures && property.features.bedrooms > 0 && (
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{property.features.bedrooms} bed</span>
          <span>•</span>
          <span>{property.features.bathrooms} bath</span>
          <span>•</span>
          <span>{property.features.carSpaces} car</span>
        </div>
      )}

      {property.description && (
        <p className="text-sm text-gray-600 line-clamp-3">
          {property.description}
        </p>
      )}
    </div>
  );
};

// Property Card Actions Component
interface PropertyCardActionsProps {
  children?: React.ReactNode;
  showDefaultActions?: boolean;
  className?: string;
}

const PropertyCardActions: React.FC<PropertyCardActionsProps> = ({
  children,
  showDefaultActions = true,
  className = "",
}) => {
  const { property, onView, onEdit, onDelete } = usePropertyCard();

  return (
    <div
      className={`flex items-center justify-between p-4 border-t bg-gray-50 ${className}`}
    >
      <div className="text-xs text-gray-500">
        Updated{" "}
        {new Date(property.metadata.updatedAt).toLocaleDateString("en-GB")}
      </div>

      <div className="flex items-center space-x-2">
        {children}
        {showDefaultActions && (
          <>
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(property)}
              >
                View
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(property)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(property)}
              >
                Delete
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Property Card Badge Component
interface PropertyCardBadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "destructive";
  className?: string;
}

const PropertyCardBadge: React.FC<PropertyCardBadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  return (
    <Badge variant={variant} className={className}>
      {children}
    </Badge>
  );
};

// Assign compound components
PropertyCard.Header = PropertyCardHeader;
PropertyCard.Image = PropertyCardImage;
PropertyCard.Content = PropertyCardContent;
PropertyCard.Details = PropertyCardDetails;
PropertyCard.Actions = PropertyCardActions;
PropertyCard.Badge = PropertyCardBadge;

export default PropertyCard;

// Usage Example
export const PropertyCardExample: React.FC = () => {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const sampleProperty: Property = {
    id: "1",
    address: {
      streetNumber: "123",
      streetName: "George Street",
      suburb: "Sydney",
      state: "NSW",
      postcode: "2000",
      country: "Australia",
      fullAddress: "123 George Street, Sydney NSW 2000",
      coordinates: { latitude: -33.8688, longitude: 151.2093 },
    },
    type: "commercial",
    status: "active",
    dimensions: {
      landSize: 450,
      buildingArea: 300,
      frontage: 15,
      depth: 30,
      floors: 2,
    },
    features: {
      bedrooms: 0,
      bathrooms: 2,
      carSpaces: 3,
      hasPool: false,
      hasGarage: true,
      hasGarden: false,
      airConditioning: true,
      heating: true,
    },
    financials: {
      currentValue: 750000,
      expenses: {
        rates: 5000,
        insurance: 2000,
        maintenance: 3000,
      },
      lastValuationDate: new Date(),
      priceHistory: [],
    },
    planning: {
      zone: "B3",
      heritage: { isListed: false },
      environmentalFactors: {
        floodZone: false,
        bushfireRisk: "low",
        contaminationRisk: false,
        noiseLevel: "moderate",
      },
    },
    description:
      "Prime commercial property in the heart of Sydney CBD. Excellent exposure and foot traffic.",
    images: [],
    documents: [],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "user123",
      lastModifiedBy: "user123",
      version: 1,
    },
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperties((prev) =>
      prev.includes(property.id)
        ? prev.filter((id) => id !== property.id)
        : [...prev, property.id]
    );
  };

  return (
    <div className="max-w-sm">
      <PropertyCard
        property={sampleProperty}
        isSelected={selectedProperties.includes(sampleProperty.id)}
        onSelect={handlePropertySelect}
        onView={(property) => console.log("View:", property.id)}
        onEdit={(property) => console.log("Edit:", property.id)}
        onDelete={(property) => console.log("Delete:", property.id)}
      >
        <PropertyCard.Header showSelection />
        <PropertyCard.Image />
        <PropertyCard.Content>
          <PropertyCard.Details />
        </PropertyCard.Content>
        <PropertyCard.Actions />
      </PropertyCard>
    </div>
  );
};
```

## Section 3: Advanced Form Patterns

### Multi-Step Property Form

Create a sophisticated multi-step form with validation and persistence:

```tsx
// src/components/MultiStepPropertyForm/MultiStepPropertyForm.tsx

import React, { useState, useCallback, useReducer } from "react";
import { Property, PropertyType, PlanningZone } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<StepProps>;
  validation: (data: FormData) => string[];
}

interface StepProps {
  data: FormData;
  errors: FormErrors;
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

interface FormData {
  // Basic Information
  address: {
    streetNumber: string;
    streetName: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  type: PropertyType | "";
  description: string;

  // Property Specifications
  dimensions: {
    landSize: string;
    buildingArea: string;
    frontage: string;
    depth: string;
    floors: string;
  };
  features: {
    bedrooms: string;
    bathrooms: string;
    carSpaces: string;
    hasPool: boolean;
    hasGarage: boolean;
    hasGarden: boolean;
    airConditioning: boolean;
    heating: boolean;
    builtYear: string;
  };

  // Financial Information
  financials: {
    currentValue: string;
    purchasePrice: string;
    rentalIncome: string;
    rates: string;
    insurance: string;
    maintenance: string;
  };

  // Planning & Environmental
  planning: {
    zone: PlanningZone | "";
    heightLimit: string;
    floorSpaceRatio: string;
    heritage: boolean;
    floodZone: boolean;
    bushfireRisk: "low" | "medium" | "high" | "extreme";
    contaminationRisk: boolean;
  };
}

interface FormErrors {
  [key: string]: string[];
}

interface FormState {
  currentStep: number;
  data: FormData;
  errors: FormErrors;
  touched: Record<string, boolean>;
}

type FormAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "UPDATE_FIELD"; payload: { field: string; value: any } }
  | { type: "SET_ERRORS"; payload: FormErrors }
  | { type: "SET_TOUCHED"; payload: { field: string; touched: boolean } }
  | { type: "RESET_FORM" };

const initialFormData: FormData = {
  address: {
    streetNumber: "",
    streetName: "",
    suburb: "",
    state: "NSW",
    postcode: "",
  },
  type: "",
  description: "",
  dimensions: {
    landSize: "",
    buildingArea: "",
    frontage: "",
    depth: "",
    floors: "1",
  },
  features: {
    bedrooms: "",
    bathrooms: "",
    carSpaces: "",
    hasPool: false,
    hasGarage: false,
    hasGarden: false,
    airConditioning: false,
    heating: false,
    builtYear: "",
  },
  financials: {
    currentValue: "",
    purchasePrice: "",
    rentalIncome: "",
    rates: "",
    insurance: "",
    maintenance: "",
  },
  planning: {
    zone: "",
    heightLimit: "",
    floorSpaceRatio: "",
    heritage: false,
    floodZone: false,
    bushfireRisk: "low",
    contaminationRisk: false,
  },
};

const initialState: FormState = {
  currentStep: 0,
  data: initialFormData,
  errors: {},
  touched: {},
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "UPDATE_FIELD":
      const { field, value } = action.payload;
      const fieldPath = field.split(".");

      let newData = { ...state.data };
      let current: any = newData;

      for (let i = 0; i < fieldPath.length - 1; i++) {
        current[fieldPath[i]] = { ...current[fieldPath[i]] };
        current = current[fieldPath[i]];
      }

      current[fieldPath[fieldPath.length - 1]] = value;

      return { ...state, data: newData };

    case "SET_ERRORS":
      return { ...state, errors: action.payload };

    case "SET_TOUCHED":
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.payload.field]: action.payload.touched,
        },
      };

    case "RESET_FORM":
      return initialState;

    default:
      return state;
  }
}

// Step 1: Basic Information
const BasicInformationStep: React.FC<StepProps> = ({
  data,
  errors,
  onChange,
  onNext,
  isLast,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Basic Property Information
        </h2>
        <p className="text-gray-600 mb-6">
          Start by entering the basic details about your property.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Street Number
          </label>
          <input
            type="text"
            value={data.address.streetNumber}
            onChange={(e) => onChange("address.streetNumber", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123"
          />
          {errors["address.streetNumber"] && (
            <p className="text-sm text-red-600">
              {errors["address.streetNumber"][0]}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Street Name
          </label>
          <input
            type="text"
            value={data.address.streetName}
            onChange={(e) => onChange("address.streetName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="George Street"
          />
          {errors["address.streetName"] && (
            <p className="text-sm text-red-600">
              {errors["address.streetName"][0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Postcode</label>
          <input
            type="text"
            value={data.address.postcode}
            onChange={(e) => onChange("address.postcode", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2000"
            maxLength={4}
          />
          {errors["address.postcode"] && (
            <p className="text-sm text-red-600">
              {errors["address.postcode"][0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Suburb</label>
          <input
            type="text"
            value={data.address.suburb}
            onChange={(e) => onChange("address.suburb", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Sydney"
          />
          {errors["address.suburb"] && (
            <p className="text-sm text-red-600">
              {errors["address.suburb"][0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">State</label>
          <select
            value={data.address.state}
            onChange={(e) => onChange("address.state", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="NSW">NSW</option>
            <option value="VIC">VIC</option>
            <option value="QLD">QLD</option>
            <option value="SA">SA</option>
            <option value="WA">WA</option>
            <option value="TAS">TAS</option>
            <option value="NT">NT</option>
            <option value="ACT">ACT</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Property Type
        </label>
        <select
          value={data.type}
          onChange={(e) => onChange("type", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select property type</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="industrial">Industrial</option>
          <option value="retail">Retail</option>
          <option value="office">Office</option>
          <option value="warehouse">Warehouse</option>
          <option value="mixed-use">Mixed Use</option>
          <option value="vacant-land">Vacant Land</option>
        </select>
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Describe the property's key features, location benefits, and investment potential..."
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>{isLast ? "Submit" : "Next"}</Button>
      </div>
    </div>
  );
};

// Step 2: Property Specifications (similar pattern for other steps)
const PropertySpecificationsStep: React.FC<StepProps> = ({
  data,
  errors,
  onChange,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Property Specifications</h2>
        <p className="text-gray-600 mb-6">
          Enter the physical characteristics and features of your property.
        </p>
      </div>

      {/* Dimensions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dimensions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Land Size (sqm)
            </label>
            <input
              type="number"
              value={data.dimensions.landSize}
              onChange={(e) => onChange("dimensions.landSize", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="450"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Building Area (sqm)
            </label>
            <input
              type="number"
              value={data.dimensions.buildingArea}
              onChange={(e) =>
                onChange("dimensions.buildingArea", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Frontage (m)
            </label>
            <input
              type="number"
              value={data.dimensions.frontage}
              onChange={(e) => onChange("dimensions.frontage", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="15"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Depth (m)
            </label>
            <input
              type="number"
              value={data.dimensions.depth}
              onChange={(e) => onChange("dimensions.depth", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Floors</label>
            <input
              type="number"
              value={data.dimensions.floors}
              onChange={(e) => onChange("dimensions.floors", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Bedrooms
            </label>
            <input
              type="number"
              value={data.features.bedrooms}
              onChange={(e) => onChange("features.bedrooms", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Bathrooms
            </label>
            <input
              type="number"
              value={data.features.bathrooms}
              onChange={(e) => onChange("features.bathrooms", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Car Spaces
            </label>
            <input
              type="number"
              value={data.features.carSpaces}
              onChange={(e) => onChange("features.carSpaces", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Built Year
            </label>
            <input
              type="number"
              value={data.features.builtYear}
              onChange={(e) => onChange("features.builtYear", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2000"
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        {/* Checkboxes for boolean features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "hasPool", label: "Swimming Pool" },
            { key: "hasGarage", label: "Garage" },
            { key: "hasGarden", label: "Garden" },
            { key: "airConditioning", label: "Air Conditioning" },
            { key: "heating", label: "Heating" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={key}
                checked={
                  data.features[key as keyof typeof data.features] as boolean
                }
                onChange={(e) => onChange(`features.${key}`, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={key}
                className="text-sm font-medium text-gray-700"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        {!isFirst && (
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
        )}
        <Button onClick={onNext} className={isFirst ? "ml-auto" : ""}>
          {isLast ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
};

// Main Multi-Step Form Component
interface MultiStepPropertyFormProps {
  onSubmit: (property: Omit<Property, "id" | "metadata">) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<Property>;
}

const MultiStepPropertyForm: React.FC<MultiStepPropertyFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  // Define form steps
  const steps: FormStep[] = [
    {
      id: "basic",
      title: "Basic Information",
      description: "Property address and type",
      component: BasicInformationStep,
      validation: (data) => {
        const errors: string[] = [];
        if (!data.address.streetNumber)
          errors.push("Street number is required");
        if (!data.address.streetName) errors.push("Street name is required");
        if (!data.address.suburb) errors.push("Suburb is required");
        if (!data.address.postcode) errors.push("Postcode is required");
        if (!data.type) errors.push("Property type is required");
        return errors;
      },
    },
    {
      id: "specifications",
      title: "Property Specifications",
      description: "Dimensions and features",
      component: PropertySpecificationsStep,
      validation: (data) => {
        const errors: string[] = [];
        if (
          data.dimensions.landSize &&
          isNaN(Number(data.dimensions.landSize))
        ) {
          errors.push("Land size must be a valid number");
        }
        if (
          data.dimensions.buildingArea &&
          isNaN(Number(data.dimensions.buildingArea))
        ) {
          errors.push("Building area must be a valid number");
        }
        return errors;
      },
    },
    // Add more steps as needed
  ];

  const currentStep = steps[state.currentStep];

  const handleFieldChange = useCallback((field: string, value: any) => {
    dispatch({ type: "UPDATE_FIELD", payload: { field, value } });
  }, []);

  const handleNext = useCallback(() => {
    const currentStepErrors = currentStep.validation(state.data);

    if (currentStepErrors.length > 0) {
      dispatch({
        type: "SET_ERRORS",
        payload: { [currentStep.id]: currentStepErrors },
      });
      return;
    }

    if (state.currentStep < steps.length - 1) {
      dispatch({ type: "SET_STEP", payload: state.currentStep + 1 });
    } else {
      handleSubmit();
    }
  }, [state.currentStep, state.data, currentStep]);

  const handlePrevious = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: "SET_STEP", payload: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const handleSubmit = async () => {
    try {
      // Convert form data to Property format
      const propertyData: Omit<Property, "id" | "metadata"> = {
        address: {
          ...state.data.address,
          country: "Australia",
          fullAddress: `${state.data.address.streetNumber} ${state.data.address.streetName}, ${state.data.address.suburb} ${state.data.address.state} ${state.data.address.postcode}`,
          coordinates: { latitude: 0, longitude: 0 }, // Would be geocoded
        },
        type: state.data.type as PropertyType,
        status: "active",
        dimensions: {
          landSize: Number(state.data.dimensions.landSize) || 0,
          buildingArea: Number(state.data.dimensions.buildingArea) || 0,
          frontage: Number(state.data.dimensions.frontage) || 0,
          depth: Number(state.data.dimensions.depth) || 0,
          floors: Number(state.data.dimensions.floors) || 1,
        },
        features: {
          bedrooms: Number(state.data.features.bedrooms) || 0,
          bathrooms: Number(state.data.features.bathrooms) || 0,
          carSpaces: Number(state.data.features.carSpaces) || 0,
          hasPool: state.data.features.hasPool,
          hasGarage: state.data.features.hasGarage,
          hasGarden: state.data.features.hasGarden,
          airConditioning: state.data.features.airConditioning,
          heating: state.data.features.heating,
          builtYear: Number(state.data.features.builtYear) || undefined,
        },
        financials: {
          currentValue: Number(state.data.financials.currentValue) || 0,
          purchasePrice:
            Number(state.data.financials.purchasePrice) || undefined,
          rentalIncome: Number(state.data.financials.rentalIncome) || undefined,
          expenses: {
            rates: Number(state.data.financials.rates) || 0,
            insurance: Number(state.data.financials.insurance) || 0,
            maintenance: Number(state.data.financials.maintenance) || 0,
          },
          lastValuationDate: new Date(),
          priceHistory: [],
        },
        planning: {
          zone: state.data.planning.zone as PlanningZone,
          heightLimit: Number(state.data.planning.heightLimit) || undefined,
          floorSpaceRatio:
            Number(state.data.planning.floorSpaceRatio) || undefined,
          heritage: {
            isListed: state.data.planning.heritage,
          },
          environmentalFactors: {
            floodZone: state.data.planning.floodZone,
            bushfireRisk: state.data.planning.bushfireRisk,
            contaminationRisk: state.data.planning.contaminationRisk,
            noiseLevel: "low",
          },
        },
        description: state.data.description,
        images: [],
        documents: [],
      };

      await onSubmit(propertyData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const progress = ((state.currentStep + 1) / steps.length) * 100;

  const StepComponent = currentStep.component;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Add New Property
              </CardTitle>
              <p className="text-gray-600">
                Step {state.currentStep + 1} of {steps.length}:{" "}
                {currentStep.title}
              </p>
            </div>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-500">{currentStep.description}</p>
          </div>
        </CardHeader>

        <CardContent>
          <StepComponent
            data={state.data}
            errors={state.errors}
            onChange={handleFieldChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={state.currentStep === 0}
            isLast={state.currentStep === steps.length - 1}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiStepPropertyForm;
```

## Practical Exercises

### Exercise 1: Property Filter Context

Create a context system for managing complex property filters:

1. Implement filter state management with reducer pattern
2. Add filter persistence to localStorage
3. Create filter history and quick filter presets
4. Build filter analytics and usage tracking

### Exercise 2: Real-time Property Updates

Implement real-time property updates using WebSocket connection:

1. Create WebSocket context for real-time data
2. Handle connection states and reconnection logic
3. Implement optimistic updates with rollback
4. Add conflict resolution for concurrent edits

### Exercise 3: Property Analysis Workflow

Build a multi-step property analysis workflow:

1. Create workflow state management
2. Implement step validation and conditional routing
3. Add progress saving and restoration
4. Build workflow analytics and performance tracking

## Summary

This module covered advanced React patterns essential for building sophisticated property analysis applications:

- **Context API**: Comprehensive state management for property data and UI state
- **Compound Components**: Flexible, reusable component systems
- **Advanced Forms**: Multi-step forms with validation and state persistence
- **Performance Patterns**: Optimisation techniques for large datasets
- **Error Boundaries**: Robust error handling and recovery

These patterns provide the foundation for building scalable, maintainable React applications that can handle complex property management requirements.

## Navigation

- [← Previous: Phase 1 - Foundation Technologies](../Phase-1-Foundation-Technologies/README.md)
- [Next: Module 2.2 - Data Management and APIs →](./Module-2.2-Data-Management-and-APIs.md)
- [↑ Back to Phase 2 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)
