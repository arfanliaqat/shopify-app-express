import { Request, Response, Router } from "express"
import { loadConnectedShop } from "../shop/shop.middleware"
import { HandledError, Forbidden, handleErrors } from "../util/error"
import { getLocals } from "../util/locals"
import moment from "moment"
import { findShopResourceById } from "../shopResource/shopResource.service"
import { findDeliverySlots } from "./deliverySlots.service"

const router = Router()

router.use(loadConnectedShop)

router.get("/resources/:shopResourceId/calendar_page", async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		const { from, to } = req.query
		if (!from || !to) {
			throw new HandledError("Missing from/to parameters")
		}
		const mFrom = moment(from.toString())
		const mTo = moment(to.toString())
		if (mFrom.diff(mTo, "days") > 45) {
			throw new HandledError("Incorrect from/to parameters")
		}
		const { shopResourceId } = req.params
		const shopResource = await findShopResourceById(shopResourceId)
		if (!shopResource) {
			throw new HandledError("Shop resource not found")
		}
		if (!connectedShop || shopResource.shopId != connectedShop.id) {
			throw new Forbidden("The shop resource doesn't belong to the shop")
		}
		const slots = await findDeliverySlots(shopResourceId, mFrom, mTo)
		res.send({ shopResource, slots })
	} catch (error) {
		handleErrors(res, error)
	}
})

router.post("/resources/{shopResourceId}/slots", async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		// $request->validate([
		// 	"dates" => "required|starts_with:[|ends_with:]",
		// 	"size" => "required|numeric"
		// ]);
		// $dates = collect(json_decode($request->input("dates")));
		// $size = $request->input("size");
		// $slot = DeliverySlot::createSlot($shopResourceId, $dates, $size);
		// return Response::json(DeliverySlotViewModel::create($slot));
	} catch (error) {
		handleErrors(res, error)
	}
})

router.get("/delivery_slots/{deliverySlotId}/page", async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		// $slot = DeliverySlot::find($deliverySlotId);
		// $shopResource = ShopResource::find($slot->shop_resource_id);
		// return Response::json([
		// 	"shopResource" => ShopResourceViewModel::create($shopResource),
		// 	"deliverySlot" => DeliverySlotViewModel::create($slot)
		// ]);
	} catch (error) {
		handleErrors(res, error)
	}
})

router.post("/delivery_slots/{deliverySlotId}", async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		// $deliverySlot = DeliverySlot::find($deliverySlotId);

		// $request->validate([
		// 	"newDates" => "starts_with:[|ends_with:]",
		// 	"size" => "required|numeric"
		// ]);

		// $newDates = collect(json_decode($request->input("newDates")));
		// $deliverySlot->size = $request->input("size");
		// $deliverySlot->addNewDates($newDates);
		// $deliverySlot->save();
	} catch (error) {
		handleErrors(res, error)
	}
})

router.delete("/delivery_slots/{deliverySlotId}", async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		// $deliverySlot = DeliverySlot::find($deliverySlotId);
		// $deliverySlot->delete();
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
