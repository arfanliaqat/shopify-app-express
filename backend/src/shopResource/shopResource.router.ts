import { Request, Response, Router } from "express"
import { loadConnectedShop } from "../shop/shop.middleware"
import { Shop } from "../shop/shop.model"
import { findShopResources } from "./shopResource.service"

const router = Router()

router.get("/resources", loadConnectedShop, async (req: Request, res: Response) => {
	const connectedShop = res.locals.connectedShop as Shop
	const resources = await findShopResources(connectedShop)
	res.send(resources)
})

router.post("/resources", loadConnectedShop, () => {
	// $resourceIds = $request->input("resourceIds");
	// if (!$resourceIds || empty($resourceIds)) {
	// 	return Response::json(["error" => "'resourceIds' is missing or empty"]);
	// }
	// $shop = Auth::user();
	// foreach ($resourceIds as $gid) {
	// 	$parsedGid = ShopResource::parseResourceGid($gid);
	// 	if (!$parsedGid) {
	// 		return Response::json(["error" => "'gid' could not be parsed"]);
	// 	}
	// 	$title = NULL;
	// 	if ($parsedGid["type"] == "Product") {
	// 		$product = Product::findProductByGid($shop->api(), $gid);
	// 		if (!$product) {
	// 			return Response::json(["error" => "The product could not be found ($gid)"]);
	// 		}
	// 		$title = $product->title;
	// 	} else {
	// 		return Response::json(["error" => "Resource type not implemented ($gid)"]);
	// 	}
	// 	ShopResource::createShopResource($shop->id, $parsedGid["type"], $parsedGid["id"], $title);
	// }
	// return "";
})

export default router
