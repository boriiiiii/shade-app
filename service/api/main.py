from dotenv import load_dotenv
from fastapi import FastAPI
import os
import time
# Charger les variables d'environnement
load_dotenv()

app = FastAPI()

# Récupérer les variables d'environnement
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


@app.get("/")
def read_root():
    time.sleep(5)
    return {
        "hello": "world",
        "supabase_configured": SUPABASE_URL is not None
    }
