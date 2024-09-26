from dotenv import load_dotenv
import os

load_dotenv()

APP_NAME = os.getenv('APP_NAME')
S2_API_KEY = os.getenv('S2_API_KEY')