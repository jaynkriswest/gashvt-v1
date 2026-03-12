from fastapi import FastAPI, Depends, HTTPException
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

@app.get("/inventory/{company_name}")
async def get_inventory(company_name: str):
    # Logic moved from Streamlit to here for security
    try:
        res = supabase.table("batches").select("*").eq("company", company_name).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/truck-intake")
async def register_truck(data: dict):
    # Process truck logic here
    return {"status": "success", "message": "Truck intake registered"}