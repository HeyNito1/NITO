# import os
# import stripe
# import razorpay
# from datetime import datetime, timezone, timedelta
# from fastapi import APIRouter, HTTPException, Depends, Request, Header
# from pydantic import BaseModel
# from typing import Literal

# from backend.database import SessionLocal
# from backend.models import User, PaymentOrder
# from backend.auth import get_current_user  # to verify the identity of logged in user 
# from backend.config import (
#     RAZORPAY_KEY_ID,
#     RAZORPAY_KEY_SECRET,
#     RAZORPAY_WEBHOOK_SECRET,
#     STRIPE_SECRET_KEY,
#     STRIPE_WEBHOOK_SECRET
# )

# # /payments/create-order     /payments/webhook/razorpay     /payments/webhook/stripe
# router = APIRouter(prefix="/payments", tags=["Payments"])

# stripe.api_key = STRIPE_SECRET_KEY
# razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)) if RAZORPAY_KEY_ID else None

# # PRICING CONFIGURATION
# PRICING_PLANS = {       # as for free plan no payment required 
#     "pro_monthly": {
#         "INR": 299.0,     # ₹299 per month
#         "USD": 3.15,      # $3.15 per month
#         "days": 30,
#         "token_limit": 200_000
#     },
#     "pro_yearly": {
#         "INR": 999.0,    # ₹999 per year
#         "USD": 10.53,     # $10.53 per year
#         "days": 365,
#         "token_limit": 500_000
#     }
# }


# class CreateOrderRequest(BaseModel):
#     plan: Literal["pro_monthly", "pro_yearly"]
#     currency: Literal["INR", "USD"]


# @router.post("/create-order")     # to purchase order -- request 
# def create_payment_order(
#     request: CreateOrderRequest,    # plan , currency 
#     user_id: str = Depends(get_current_user)
# ):
#     """
#     User plan aur currency chooses-:
#     - Currency INR -> Razorpay Order return karega (UPI/Cards)
#     - Currency USD -> Stripe Checkout URL return karega (Global Cards/Apple Pay)
#     """
#     plan_info = PRICING_PLANS[request.plan]
#     amount = plan_info[request.currency]

#     with SessionLocal() as session:
#         # 1. INDIAN USERS: RAZORPAY
#         if request.currency == "INR":
#             if not razorpay_client:   # check razropay connected or not 
#                 raise HTTPException(status_code=500, detail="Razorpay not configured in .env")

#             amount_paise = int(amount * 100)    # rupees --- paise 
#             order_data = {
#                 "amount": amount_paise,
#                 "currency": "INR",
#                 "payment_capture": 1,  # payment successfull , razorpay automatically capture 
#                 "notes": {"user_id": user_id, "plan": request.plan}
#             }
#             rzp_order = razorpay_client.order.create(data=order_data)

#             # DB record
#             db_order = PaymentOrder(
#                 user_id=user_id,
#                 order_id=rzp_order["id"],
#                 provider="razorpay",
#                 amount=amount,
#                 currency="INR",
#                 plan=request.plan,
#                 status="created"
#             )
#             session.add(db_order)
#             session.commit()

#             return {
#                 "provider": "razorpay",
#                 "order_id": rzp_order["id"],
#                 "amount": amount,
#                 "currency": "INR",
#                 "key_id": RAZORPAY_KEY_ID
#             }


#         # 2. FOREIGN USERS: STRIPE
#         elif request.currency == "USD":
#             if not STRIPE_SECRET_KEY:
#                 raise HTTPException(status_code=500, detail="Stripe not configured in .env")

#             checkout_session = stripe.checkout.Session.create(    # checkout page open for payment 
#                 payment_method_types=["card"],
#                 line_items=[{
#                     "price_data": {
#                         "currency": "usd",
#                         "unit_amount": int(amount * 100),   # cents 
#                         "product_data": {
#                             "name": f"HEYNITO {request.plan.replace('_', ' ').title()}",
#                             "description": f"Full access plan for {plan_info['days']} days"
#                         },
#                     },
#                     "quantity": 1,
#                 }],
#                 mode="payment",   # one time payement mode 
#                 success_url="https://yourdomain.com/payment-success?session_id={CHECKOUT_SESSION_ID}",  # success page 
#                 cancel_url="https://yourdomain.com/pricing",   # pricing page 
#                 client_reference_id=user_id,
#                 metadata={"user_id": user_id, "plan": request.plan}
#             )

#             db_order = PaymentOrder(
#                 user_id=user_id,
#                 order_id=checkout_session.id,
#                 provider="stripe",
#                 amount=amount,
#                 currency="USD",
#                 plan=request.plan,
#                 status="created"
#             )
#             session.add(db_order)
#             session.commit()

#             return {
#                 "provider": "stripe",
#                 "checkout_url": checkout_session.url,
#                 "order_id": checkout_session.id
#             }


# # ---------------- WEBHOOKS (Auto-Upgrade to Pro) ----------------

# def _upgrade_user(order_id: str):
#     """Payment success verify , user's limit nd plan upgrade """
#     with SessionLocal() as session:
#         order = session.query(PaymentOrder).filter(PaymentOrder.order_id == order_id).first()
#         if not order or order.status == "paid":   # not a paid user , already a paid user -- pehle se hi 
#             return

#         order.status = "paid"
#         user = session.get(User, order.user_id)
#         if user:
#             plan_info = PRICING_PLANS[order.plan]
#             user.plan = order.plan   # plan update 
#             user.daily_token_limit = plan_info["token_limit"]
#             user.plan_expires_at = datetime.now(timezone.utc) + timedelta(days=plan_info["days"])

#         session.commit()


# @router.post("/webhook/razorpay")     # razorpay sends our backend the  payment notification 
# async def razorpay_webhook(request: Request):
#     """Razorpay payment notification listener"""
#     body = await request.body()
#     signature = request.headers.get("X-Razorpay-Signature") # to check genuine or fake payment 

#     try:        # signature verification 
#         razorpay_client.utility.verify_webhook_signature(
#             body.decode("utf-8"), signature, RAZORPAY_WEBHOOK_SECRET
#         )
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid Razorpay signature")

#     data = await request.json()
#     if data.get("event") == "order.paid":
#         order_id = data["payload"]["order"]["entity"]["id"]
#         _upgrade_user(order_id)  # function called - to update the plan 

#     return {"status": "success"}


# @router.post("/webhook/stripe")
# async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
#     """Stripe payment notification listener"""
#     payload = await request.body()
#     try:
#         event = stripe.Webhook.construct_event(
#             payload, stripe_signature, STRIPE_WEBHOOK_SECRET
#         )
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid Stripe signature")

#     if event["type"] == "checkout.session.completed":
#         session_id = event["data"]["object"]["id"]
#         _upgrade_user(session_id)

#     return {"status": "success"}

import os
import logging
import stripe
import razorpay

from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    Request,
    Header
)

from pydantic import BaseModel
from typing import Literal
from starlette.concurrency import run_in_threadpool

from backend.auth import get_current_user

from backend.config import (
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET
)

from backend.repositories.payment_repository import (
    create_payment_record,
    upgrade_user
)

from backend.repositories.usage_repository import (
    get_active_user
)


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

logger = logging.getLogger(__name__)

stripe.api_key = STRIPE_SECRET_KEY

razorpay_client = (
    razorpay.Client(
        auth=(
            RAZORPAY_KEY_ID,
            RAZORPAY_KEY_SECRET
        )
    )
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
    else None
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
).rstrip("/")


PRICING_PLANS = {
    "pro_monthly": {
        "INR": 299.0,
        "USD": 3.15,
        "days": 30,
        "token_limit": 200_000
    },
    "pro_yearly": {
        "INR": 999.0,
        "USD": 10.53,
        "days": 365,
        "token_limit": 500_000
    }
}


class CreateOrderRequest(BaseModel):
    plan: Literal["pro_monthly", "pro_yearly"]
    currency: Literal["INR", "USD"]


@router.post("/create-order")
def create_payment_order(
    request: CreateOrderRequest,
    user_id: str = Depends(get_current_user)
):

    get_active_user(user_id)

    plan_info = PRICING_PLANS[request.plan]
    amount = plan_info[request.currency]

    # Razorpay
    if request.currency == "INR":

        if not razorpay_client:
            raise HTTPException(
                status_code=503,
                detail="Razorpay not configured"
            )

        order = razorpay_client.order.create(
            data={
                "amount": round(amount * 100),
                "currency": "INR",
                "payment_capture": 1,
                "notes": {
                    "user_id": user_id,
                    "plan": request.plan
                }
            }
        )

        create_payment_record(
            user_id=user_id,
            order_id=order["id"],
            provider="razorpay",
            amount=amount,
            currency="INR",
            plan=request.plan
        )

        return {
            "provider": "razorpay",
            "order_id": order["id"],
            "amount": amount,
            "currency": "INR",
            "key_id": RAZORPAY_KEY_ID
        }

    # Stripe
    if not STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Stripe not configured"
        )

    checkout_session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": round(amount * 100),
                    "product_data": {
                        "name": (
                            f"HEYNITO "
                            f"{request.plan.replace('_', ' ').title()}"
                        ),
                        "description": (
                            f"Full access for "
                            f"{plan_info['days']} days"
                        )
                    }
                },
                "quantity": 1
            }
        ],
        mode="payment",
        success_url=(
            f"{FRONTEND_URL}/payment-success"
            "?session_id={CHECKOUT_SESSION_ID}"
        ),
        cancel_url=f"{FRONTEND_URL}/pricing",
        client_reference_id=user_id,
        metadata={
            "user_id": user_id,
            "plan": request.plan
        }
    )

    create_payment_record(
        user_id=user_id,
        order_id=checkout_session.id,
        provider="stripe",
        amount=amount,
        currency="USD",
        plan=request.plan
    )

    return {
        "provider": "stripe",
        "checkout_url": checkout_session.url,
        "order_id": checkout_session.id
    }


@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request):

    if not razorpay_client or not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Razorpay webhook not configured"
        )

    body = await request.body()

    signature = request.headers.get(
        "X-Razorpay-Signature"
    )

    try:
        razorpay_client.utility.verify_webhook_signature(
            body.decode("utf-8"),
            signature,
            RAZORPAY_WEBHOOK_SECRET
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid Razorpay signature"
        )

    data = await request.json()

    if data.get("event") == "order.paid":

        order_id = data["payload"]["order"]["entity"]["id"]

        try:
            await run_in_threadpool(
                upgrade_user,
                order_id,
                "razorpay",
                PRICING_PLANS
            )

        except Exception:
            logger.exception("Razorpay upgrade failed")

            raise HTTPException(
                status_code=500,
                detail="Payment processing failed"
            )

    return {"status": "success"}


@router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None)
):

    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Stripe webhook not configured"
        )

    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload,
            stripe_signature,
            STRIPE_WEBHOOK_SECRET
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid Stripe signature"
        )

    if event["type"] in (
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded"
    ):

        checkout = event["data"]["object"]

        if checkout.get("payment_status") == "paid":

            try:
                await run_in_threadpool(
                    upgrade_user,
                    checkout["id"],
                    "stripe",
                    PRICING_PLANS
                )

            except Exception:
                logger.exception("Stripe upgrade failed")

                raise HTTPException(
                    status_code=500,
                    detail="Payment processing failed"
                )

    return {"status": "success"}