from datetime import datetime, timezone, timedelta

from backend.mongodb import client, users, payment_orders


def create_payment_record(
    user_id,
    order_id,
    provider,
    amount,
    currency,
    plan
):
    payment_orders.insert_one({
        "user_id": user_id,
        "order_id": order_id,
        "provider": provider,
        "amount": amount,
        "currency": currency,
        "plan": plan,
        "status": "created",
        "created_at": datetime.now(timezone.utc),
        "paid_at": None
    })


def upgrade_user(order_id, provider, pricing_plans):

    def apply_payment(session):

        order = payment_orders.find_one(
            {
                "order_id": order_id,
                "provider": provider
            },
            session=session
        )

        if not order:
            raise ValueError("Payment order not found")

        if order["status"] == "paid":
            return

        plan_info = pricing_plans[order["plan"]]

        now = datetime.now(timezone.utc)

        result = users.update_one(
            {"_id": order["user_id"]},
            {
                "$set": {
                    "plan": order["plan"],
                    "daily_token_limit": plan_info["token_limit"],
                    "plan_expires_at": now + timedelta(
                        days=plan_info["days"]
                    )
                }
            },
            session=session
        )

        if result.matched_count == 0:
            raise ValueError("User not found")

        payment_orders.update_one(
            {"_id": order["_id"]},
            {
                "$set": {
                    "status": "paid",
                    "paid_at": now
                }
            },
            session=session
        )

    with client.start_session() as session:
        session.with_transaction(apply_payment)