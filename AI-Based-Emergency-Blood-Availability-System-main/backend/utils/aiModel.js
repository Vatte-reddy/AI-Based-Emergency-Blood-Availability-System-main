import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PYTHON_PATH = path.join(__dirname, "..", "..", "legacy_backup", "venv", "Scripts", "python.exe");
const SCRIPT_PATH = path.join(__dirname, "..", "scripts", "predict_donor.py");

/**
 * Predicts the likelihood of a donor responding based on RFMT features.
 * Calls a Python script that loads a .pkl model.
 */
export const predictDonorLikelihood = (r, f, m, t) => {
  return new Promise((resolve, reject) => {
    const input = JSON.stringify({
      Recency: r,
      Frequency: f,
      Monetary: m,
      Time: t
    });

    const pythonProcess = spawn(PYTHON_PATH, [SCRIPT_PATH]);

    let output = "";
    let error = "";
    let completed = false;

    // Timeout mechanism
    const timeout = setTimeout(() => {
      if (!completed) {
        pythonProcess.kill();
        reject(new Error("AI Model prediction timed out after 5s"));
      }
    }, 5000);

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    pythonProcess.on("close", (code) => {
      completed = true;
      clearTimeout(timeout);
      if (code !== 0 && code !== null) {
        console.error(`[AI-MODEL] Python process exited with code ${code}: ${error}`);
        return reject(new Error(error || `Python process failed with code ${code}`));
      }

      if (code === null) {
        // Already handled by timeout reject
        return;
      }

      try {
        const result = JSON.parse(output.trim());
        if (result.success) {
          resolve(result.probability);
        } else {
          reject(new Error(result.error));
        }
      } catch (err) {
        console.error(`[AI-MODEL] Failed to parse Python output: ${output}`);
        reject(new Error("Failed to parse prediction result"));
      }
    });

    // Send input to stdin
    pythonProcess.stdin.write(input);
    pythonProcess.stdin.end();
  });
};
