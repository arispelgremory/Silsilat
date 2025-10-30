# Python Setup for Gold Evaluator

The SAG creation process uses a Python script (`agent/gold_evaluator.py`) to evaluate gold loan risks.

## Windows Setup

### Option 1: Install Python from Python.org (Recommended)

1. Download Python from https://www.python.org/downloads/
2. During installation, **check "Add Python to PATH"**
3. After installation, verify in PowerShell:
   ```powershell
   python --version
   ```

### Option 2: Use Windows Python Launcher (py)

If you see the Microsoft Store message, you can use the `py` launcher:

1. The code already defaults to `py` command on Windows
2. No additional configuration needed if Python is installed

### Option 3: Configure Custom Python Path

If Python is installed in a custom location:

1. Add to your `.env` file in `backend/`:
   ```env
   PYTHON_EXECUTABLE=C:\Python311\python.exe
   ```
   Or use the full path to your Python installation.

## Linux/Mac Setup

Python is usually pre-installed. Verify with:
```bash
python3 --version
```

If needed, add to `.env`:
```env
PYTHON_EXECUTABLE=python3
```

## Install Python Dependencies

After Python is set up, install the required packages:

```bash
cd agent
pip install -r requirements.txt
```

Or on Windows with `py`:
```powershell
cd agent
py -m pip install -r requirements.txt
```

## Environment Variables for Agent

Create `agent/.env.local` with:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_LLM_MODEL=llama3.1:8b

# Phoenix Configuration (optional for observability)
PHOENIX_COLLECTOR_ENDPOINT=http://localhost:6006/v1/traces
PHOENIX_SERVICE_NAME=silsilat-gold-evaluator

# Silsilat API Configuration
SILSILAT_API_BASE=http://localhost:3000
INPUT_TOPIC_ID=0.0.YOUR_INPUT_TOPIC_ID
OUTPUT_TOPIC_ID=0.0.YOUR_OUTPUT_TOPIC_ID

# IPFS Configuration (optional)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
```

## Troubleshooting

### Error: "Python was not found"

**Symptoms:**
```
Gold Evaluator Error: Python was not found; run without arguments to install from the Microsoft Store...
```

**Solutions:**

1. **Add Python to PATH:**
   - Search for "Environment Variables" in Windows
   - Edit PATH variable
   - Add Python installation directory (e.g., `C:\Python311\`)

2. **Use py launcher:**
   - Already configured as default on Windows
   - Should work if Python is installed

3. **Specify exact path in .env:**
   ```env
   PYTHON_EXECUTABLE=C:\Users\YourName\AppData\Local\Programs\Python\Python311\python.exe
   ```

### Error: "ModuleNotFoundError"

**Symptoms:**
```
ModuleNotFoundError: No module named 'pydantic'
```

**Solution:**
```bash
cd agent
pip install -r requirements.txt
```

### Test the Gold Evaluator

Test the Python script directly:

```bash
cd agent
echo '{"principal_myr": 5000, "gold_weight_g": 25, "purity": 918, "tenure_days": 90}' | python gold_evaluator.py -
```

Expected output: JSON with risk evaluation results.

## How It Works

1. Backend calls `callGoldEvaluator()` from `src/util/gold-evaluator.ts`
2. Spawns a Python subprocess
3. Sends loan data via stdin as JSON
4. Receives evaluation results via stdout as JSON
5. Returns results to SAG controller

The Python command priority:
- Windows: `PYTHON_EXECUTABLE` env var → `py` → `python3` → `python`
- Unix: `PYTHON_EXECUTABLE` env var → `python3` → `python`

