import { ShopService } from "./shop.service"
import { Shop } from "./shop.model"

export class ShopBuilder {
	private email?: string
	private domain?: string

	withEmail(email: string): ShopBuilder {
		this.email = email
		return this
	}

	withDomain(domain: string): ShopBuilder {
		this.domain = domain
		return this
	}

	async buildAndSave(): Promise<Shop | undefined> {
		const newShop = new Shop(
			this.email || "example.com",
			this.domain || "my@email.com",
			this.domain || "my@email.com",
			undefined,
			{}
		)
		return await ShopService.insert(newShop)
	}
}
