import os
from dotenv import load_dotenv

load_dotenv()  # env variables loaded 

DATABASE_URL = os.getenv("DATABASE_URL")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
LLAMA_API_KEY = os.getenv("LLAMA_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
MIMO_API_KEY = os.getenv("MIMO_API_KEY", LLAMA_API_KEY)
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", LLAMA_API_KEY)

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# if these arent given then the app will not start ! 
required_settings = {
    "GROQ_API_KEY": GROQ_API_KEY,
    "DATABASE_URL": DATABASE_URL,
    "JWT_SECRET_KEY": JWT_SECRET_KEY   
}

# other keys r kept optional so that if any key is missing -- chatbot dont stop !! 
for name, value in required_settings.items():
    if not value:
        raise ValueError(f"{name} missing in .env")
