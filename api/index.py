import sys
from pathlib import Path

# Ensure the api/ directory is on the path so server.py can be imported
sys.path.insert(0, str(Path(__file__).parent))

from server import app
from mangum import Mangum

# Vercel serverless entry point
handler = Mangum(app, lifespan="off")
