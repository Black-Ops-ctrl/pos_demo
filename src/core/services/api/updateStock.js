import api from './config';
import { updateProduct } from './updateProduct';

export const updateStockAfterSale = async (saleData, products) => {
  try {
    const stockUpdates = [];
    const failedUpdates = [];

    for (const item of saleData.cartItems) {
      const productInInventory = products.find(p => 
        p.barcode === item.barcode || p.id === item.id
      );

      if (!productInInventory) {
        failedUpdates.push({
          product: item.title,
          reason: "Product not found in inventory"
        });
        continue;
      }

      const currentQuantity = parseInt(productInInventory.quantity) || 0;
      const newQuantity = currentQuantity - item.quantity;

      if (newQuantity < 0) {
        failedUpdates.push({
          product: item.title,
          reason: `Insufficient stock. Available: ${currentQuantity}, Requested: ${item.quantity}`
        });
        continue;
      }

      const updateResult = await updateProduct(productInInventory.id, {
        quantity: newQuantity
      });

      if (updateResult.success) {
        stockUpdates.push({
          product: item.title,
          oldQuantity: currentQuantity,
          newQuantity: newQuantity
        });
      } else {
        failedUpdates.push({
          product: item.title,
          reason: updateResult.message || "Update failed"
        });
      }
    }

    return {
      success: failedUpdates.length === 0,
      updated: stockUpdates,
      failed: failedUpdates,
      message: failedUpdates.length === 0 
        ? "All stock updated successfully" 
        : `${failedUpdates.length} item(s) failed to update`
    };

  } catch (error) {
    return { 
      success: false, 
      message: error.message || "Failed to update stock",
      updated: [],
      failed: [{ reason: "System error: " + error.message }]
    };
  }
};