import { h } from "preact"
import { DEFAULT_SINGLE_DATE_PER_ORDER_MESSAGE } from "../../backend/src/util/constants"
import { WidgetSettings } from "./models/WidgetSettings"

interface Props {
	settings: WidgetSettings
}

export default function SingleDatePerOrderMessage({ settings }: Props) {
	const singleDatePerOrderMessage = settings.messages.singleDatePerOrderMessage ?? DEFAULT_SINGLE_DATE_PER_ORDER_MESSAGE
	return singleDatePerOrderMessage ? <div className="buunto-info-message">{singleDatePerOrderMessage}</div> : undefined
}
