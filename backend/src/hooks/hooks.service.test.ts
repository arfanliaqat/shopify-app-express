import { ShopBuilder } from "../shop/shop.builder"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"

test("Orders get properly ingested", async () => {
	const shop = await new ShopBuilder().buildAndSave()
	const shopResource = await new ShopResourceBuilder().forShop(shop!).buildAndSave()
	// TODO
})
