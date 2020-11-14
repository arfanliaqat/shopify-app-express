import { Request, Response, Router } from "express"
import { loadConnectedShop } from "../shop/shop.middleware"
import { HandledError, Forbidden, handleErrors, FormError, FormErrors, UnexpectedError } from "../util/error"
import { getLocals } from "../util/locals"
import moment, { Moment } from "moment"
import { createDeliverySlot, findDeliverySlots } from "./deliverySlots.service"
import _ from "lodash"
import { loadShopResource } from "../shopResource/shopResource.middleware"
import { DeliverySlot } from "./deliverySlots.model"

const router = Router()

router.use(loadConnectedShop)

router.get("/resources/:shopResourceId/calendar_page", loadShopResource, async (req: Request, res: Response) => {
	try {
		const { shopResource } = getLocals(res)
		const { from, to } = req.query
		if (!from || !to) {
			throw new HandledError("Missing from/to parameters")
		}
		const mFrom = moment(from.toString())
		const mTo = moment(to.toString())
		if (mFrom.diff(mTo, "days") > 45) {
			throw new HandledError("Incorrect from/to parameters")
		}
		const slots = await findDeliverySlots(shopResource?.id || "", mFrom, mTo)
		res.send({ shopResource, deliverySlots: DeliverySlot.toViewModels(slots) })
	} catch (error) {
		handleErrors(res, error)
	}
})

function validateDates(errors: FormError[], strDates?: any): Moment[] | undefined {
	if (!strDates) {
		errors.push({ field: "dates", message: "Please select dates" })
		return
	}
	if (!_.isArray(strDates)) {
		throw new UnexpectedError("Dates should be an array of strings")
	}
	return strDates.map((date) => moment(date))
}

function validateQuantity(errors: FormError[], quantity?: any): number | undefined {
	if (!quantity) errors.push({ field: "quantity", message: "Please provide a quantity" })
	if (!_.isNumber(quantity)) errors.push({ field: "quantity", message: "The quantity should be a number" })
	return quantity
}

router.post("/resources/:shopResourceId/slots", loadShopResource, async (req: Request, res: Response) => {
	try {
		const { connectedShop, shopResource } = getLocals(res)
		const errors = [] as FormError[]
		const dates = validateDates(errors, req.body.dates)
		const quantity = validateQuantity(errors, req.body.quantity)
		if (!dates || !quantity || errors.length > 0) throw new FormErrors(errors)
		if (!connectedShop || !shopResource || shopResource.shopId != connectedShop.id) {
			throw new Forbidden("The shop resource doesn't belong to the shop")
		}
		const deliverySlot = await createDeliverySlot(shopResource?.id || "", dates, quantity)
		res.send(deliverySlot?.toViewModel())
	} catch (error) {
		handleErrors(res, error)
	}
})

router.get("/delivery_slots/:deliverySlotId/page", async (req: Request, res: Response) => {
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

router.post("/delivery_slots/:deliverySlotId", async (req: Request, res: Response) => {
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

router.delete("/delivery_slots/:deliverySlotId", async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		// $deliverySlot = DeliverySlot::find($deliverySlotId);
		// $deliverySlot->delete();
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
