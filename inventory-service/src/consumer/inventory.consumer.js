const inventoryService = require("../services/inventory.service");

class InventoryConsumer {
    async handle(message) {

        switch (message.eventType) {

            case "ProductCreated":

                await inventoryService.createInventory(
                    message.data.productId
                );

                break;

            default:
                console.log("Unhandled event:", message.eventType);
        }
    }
}

module.exports = new InventoryConsumer();