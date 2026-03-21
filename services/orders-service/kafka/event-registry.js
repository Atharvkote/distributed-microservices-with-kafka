import {
  handleProductCreated,
  handleProductUpdated,
  handleProductDeleted,
  handleVariantCreated,
  handleVariantUpdated,
  handleVariantDeleted,
} from "./handlers/order.handler.js";

export const eventRegistry = {
  "catalog": {
    // Product Events
    PRODUCT_CREATED: handleProductCreated,
    PRODUCT_UPDATED: handleProductUpdated,
    PRODUCT_DELETED: handleProductDeleted,

    // Product Variant Events
    VARIANT_CREATED: handleVariantCreated,
    VARIANT_UPDATED: handleVariantUpdated,
    VARIANT_DELETED: handleVariantDeleted,
  },
};
