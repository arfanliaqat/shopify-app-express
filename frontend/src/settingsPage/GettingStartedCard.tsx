import React from "react"
import { Card, Link, List } from "@shopify/polaris"

interface Props {
	onChangeTabClick: (tabId: string) => void
}

export default function GettingStartedCard({ onChangeTabClick }: Props) {
	return (
		<Card title="Getting started" sectioned>
			<Card.Section title="Basic configuration">
				<List type="number">
					<List.Item>
						<Link onClick={() => onChangeTabClick("widgetPlacement")}>Widget placement</Link> - configure
						exactly where and when you want the date picker to be displayed
					</List.Item>
					<List.Item>
						<Link onClick={() => onChangeTabClick("availableDates")}>Available dates</Link> - define a set
						of rules to determine which dates to make available to your customers
					</List.Item>
					<List.Item>
						<Link onClick={() => onChangeTabClick("timeSlots")}>Time slots</Link> (optional) - give your
						customers the ability to select a time slot
					</List.Item>
					<List.Item>
						<Link onClick={() => onChangeTabClick("widgetSettings")}>Widget settings</Link> - configure the
						styles and other options of the date picker to fit your store perfectly
					</List.Item>
					<List.Item>
						<Link onClick={() => onChangeTabClick("messages")}>Messages</Link> - replace any text from the
						date picker to cover your needs or to be in another language
					</List.Item>
				</List>
			</Card.Section>
			<Card.Section title="Advanced configuration (optional)">
				<List.Item>
					<Link
						external
						url="https://buunto.helpscoutdocs.com/article/6-show-the-chosen-date-time-in-the-order-confirmation-page-after-the-checkout"
					>
						Show the chosen date/time in the order confirmation page after the checkout
					</Link>
				</List.Item>
				<List.Item>
					<Link
						external
						url="https://buunto.helpscoutdocs.com/article/4-show-the-chosen-date-time-in-the-customer-order-confirmation-email"
					>
						Show the chosen date/time in the customer order confirmation email
					</Link>
				</List.Item>
				<List.Item>
					<Link
						external
						url="https://buunto.helpscoutdocs.com/article/5-show-the-chosen-date-time-in-the-email-sent-to-the-shop-s-staff-when-receiving-a-new-order"
					>
						Show the chosen date/time in the email sent to the shop's staff when receiving a new order
					</Link>
				</List.Item>
				<List.Item>
					<Link
						external
						url="https://buunto.helpscoutdocs.com/article/9-how-to-improve-the-widgets-performance"
					>
						Improve the widget's performance and reliability
					</Link>
				</List.Item>
			</Card.Section>
		</Card>
	)
}
