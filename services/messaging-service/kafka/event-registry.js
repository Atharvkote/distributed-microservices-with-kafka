import {
  handleUserCreation,
  handleUserDeletion,
  handleUserUpdation,
  handleVendorCreation,
  handleVendorDeletion,
  handleVendorUpdation,
} from "./handlers/auth.handler.js";
import {
  handleOrderCreated,
  handleOrderStatusUpdated,
  noopCatalogOrderTopic,
} from "./handlers/order.handler.js";

export const eventRegistry = {
  "auth": {
    // User Events
    USER_CREATED: handleUserCreation,
    USER_UPDATED: handleUserUpdation,
    USER_DELETED: handleUserDeletion,

    // Vendor Profile Events
    VP_CREATED: handleVendorCreation,
    VP_UPDATED: handleVendorUpdation,
    VP_DELETED: handleVendorDeletion,
  },

  /**
   * Topic "order" carries catalog sync (PRODUCT_*, VARIANT_*) and order lifecycle (ORDER_*).
   */
  order: {
    ORDER_CREATED: handleOrderCreated,
    ORDER_STATUS_UPDATED: handleOrderStatusUpdated,
    PRODUCT_CREATED: noopCatalogOrderTopic,
    PRODUCT_UPDATED: noopCatalogOrderTopic,
    PRODUCT_DELETED: noopCatalogOrderTopic,
    VARIANT_CREATED: noopCatalogOrderTopic,
    VARIANT_UPDATED: noopCatalogOrderTopic,
    VARIANT_DELETED: noopCatalogOrderTopic,
  },

  //   "payment": {
  //     PAYMENT_SUCCESS: handlePaymentSuccess,
  //   },
};
