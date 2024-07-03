from utils import *

load_dotenv()

APP_NAME = os.getenv('APP_NAME')
client = arxiv.Client()