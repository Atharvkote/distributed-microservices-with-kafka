import {
  handleUserCreation,
  handleUserDeletion,
  handleUserUpdation,
  handleVendorCreation,
  handleVendorDeletion,
  handleVendorUpdation,
} from "./handlers/auth.handler.js";

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

  //   "order": {
  //     ORDER_CREATED: handleOrderCreated,
  //   },

  //   "payment": {
  //     PAYMENT_SUCCESS: handlePaymentSuccess,
  //   },
};
