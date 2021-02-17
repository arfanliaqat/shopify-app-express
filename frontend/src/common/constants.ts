import { AppName } from "../../../backend/src/util/constants"

export const isStockByDateApp = ((window as any).appName as AppName) == "STOCK_BY_DATE"
