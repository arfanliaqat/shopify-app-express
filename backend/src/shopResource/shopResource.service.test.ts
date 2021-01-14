import { ShopResourceService } from "./shopResource.service"

describe("ShopResourceService", () => {
	test("It converts original image URL into a thumbnail URL", () => {
		const originalUrl =
			"https://cdn.shopify.com/s/files/1/0477/4153/4361/products/the_product_image.jpg?v=1610657691"
		const expectedUrl =
			"https://cdn.shopify.com/s/files/1/0477/4153/4361/products/the_product_image_medium.jpg?v=1610657691"
		expect(ShopResourceService.getThumbnailUrlFromOriginalUrl(originalUrl)).toBe(expectedUrl)
	})
})
