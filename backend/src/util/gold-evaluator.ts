import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

interface GoldEvaluatorInput {
  principal_myr: number;
  gold_weight_g: number;
  purity: number;
  tenure_days: number;
}

interface RiskMetrics {
  gold_price_myr_per_g: number;
  purity_factor: number;
  haircut_bps: number;
  haircut_factor: number;
  collateral_value_myr: number;
  principal_myr: number;
  ltv: number;
  risk_level: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  max_safe_ltv: number;
  margin_call_ltv: number;
  vol_window_days: number;
  gold_volatility: number | null;
  fx_usd_myr: number | null;
  shop_rating: string | null;
}

interface LLMRecommendation {
  model: string;
  rationale: string;
  action: 'approve' | 'monitor' | 'margin_call' | 'reject';
}

interface RuleHit {
  code: string;
  severity: 'info' | 'warn' | 'critical';
  message: string;
  details: Record<string, any>;
}

export interface GoldEvaluatorOutput {
  schema_id: string;
  eval_id: string;
  timestamp_utc: string;
  trace_id: string;
  inputs: GoldEvaluatorInput;
  metrics: RiskMetrics;
  recommendation: LLMRecommendation;
  explanations: RuleHit[];
  policy: Record<string, any>;
}

/**
 * Get the Python executable command
 * Tries different common Python commands in order
 */
function getPythonCommand(): string {
  // Check environment variable first
  if (process.env.PYTHON_EXECUTABLE) {
    return process.env.PYTHON_EXECUTABLE;
  }
  
  // Default attempts in order of preference
  // Use python3 for consistency across platforms (especially in Docker)
  // On Windows: try python3 first, then py
  // On Unix: try python3
  const isWindows = process.platform === 'win32';
  // In Docker/Linux containers, python3 is standard
  // On Windows, prefer python3 if available, fallback to py
  return 'python3';
}

/**
 * Call the gold evaluator Python script
 * @param input - Gold loan parameters
 * @returns Promise with evaluation results
 */
export async function callGoldEvaluator(input: GoldEvaluatorInput): Promise<GoldEvaluatorOutput> {
  return new Promise((resolve, reject) => {
    // Path to the Python script
    // In Docker: /app/agent/gold_evaluator.py
    // In local dev: ../agent/gold_evaluator.py
    const possiblePaths = [
      path.join(process.cwd(), 'agent', 'gold_evaluator.py'),
      path.join(process.cwd(), '..', 'agent', 'gold_evaluator.py'),
    ];
    
    let pythonScript = possiblePaths[0];
    
    // Check if the agent directory exists in the current location first
    try {
      if (!fs.existsSync(pythonScript)) {
        pythonScript = possiblePaths[1];
      }
    } catch (e) {
      pythonScript = possiblePaths[0];
    }
    
    const pythonCmd = getPythonCommand();
    
    console.log(`Using Python command: ${pythonCmd}`);
    console.log(`Script path: ${pythonScript}`);
    
    // Log topic IDs being passed to the agent
    console.log('Topic IDs for gold evaluator agent:');
    console.log(`  INPUT_TOPIC_ID: ${process.env.INPUT_TOPIC_ID || 'NOT SET'}`);
    console.log(`  OUTPUT_TOPIC_ID: ${process.env.OUTPUT_TOPIC_ID || 'NOT SET'}`);
    console.log(`  OVERRIDE_TOPIC_ID: ${process.env.OVERRIDE_TOPIC_ID || 'NOT SET'}`);
    
    // Determine working directory for the Python process
    const agentDir = pythonScript.includes('/app/agent') 
      ? '/app/agent' 
      : path.join(process.cwd(), '..', 'agent');
    
    // Spawn Python process with UTF-8 encoding
    // Ensure the agent uses localhost to connect to the backend API when in the same container
    // Since both agent and backend run in the same container, always use localhost
    const env = {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',  // Fix Windows Unicode encoding issue
      PYTHONUNBUFFERED: '1',       // Disable Python output buffering
      // Override SILSILAT_API_BASE to always use localhost:9487 when both services are in the same container
      SILSILAT_API_BASE: 'http://localhost:9487'
    };
    
    const pythonProcess = spawn(pythonCmd, [pythonScript, '-'], {
      cwd: agentDir,
      shell: true,  // Important for Windows to resolve 'py' command
      env
    });

    // Send input data to stdin
    pythonProcess.stdin.write(JSON.stringify(input));
    pythonProcess.stdin.end();

    let stdout = '';
    let stderr = '';

    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      // Log any stderr warnings even on successful execution
      if (stderr && stderr.trim()) {
        console.warn('Gold evaluator warnings:', stderr);
      }

      if (code !== 0) {
        console.error('=== Gold Evaluator Error ===');
        console.error('Exit code:', code);
        console.error('STDERR:', stderr || '(empty)');
        console.error('STDOUT:', stdout || '(empty)');
        console.error('Input sent:', JSON.stringify(input));
        console.error('========================');
        
        const errorMsg = stderr || stdout || 'Unknown error (no output)';
        reject(new Error(`Gold evaluator failed with code ${code}: ${errorMsg}`));
        return;
      }

      try {
        // Only parse the JSON output from stdout
        console.log('Gold evaluator raw output:', stdout);
        
        // Extract JSON from stdout (strip any leading whitespace/logs)
        const jsonStart = stdout.indexOf('{');
        if (jsonStart === -1) {
          throw new Error('No JSON object found in output');
        }
        const jsonOutput = stdout.substring(jsonStart);
        
        const result = JSON.parse(jsonOutput);
        resolve(result);
      } catch (error) {
        console.error('Failed to parse gold evaluator output:', stdout);
        reject(new Error(`Failed to parse output: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });

    // Handle process errors
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    // Set timeout (2 minutes)
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Gold evaluator timeout (300s)'));
    }, 1300000);
  });
}
