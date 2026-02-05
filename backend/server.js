/**
 * Simple Backend - Reads JSON files
 * ==================================
 * No Firebase, no limits!
 */

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "..", "data", "employees");

/**
 * Sync endpoint - Returns data from JSON files
 */
app.get("/api/sync", async (req, res) => {
  try {
    console.log("\n📂 Reading from JSON files...");

    // Check if data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      return res.json({
        success: false,
        error: "No data found. Please run: python sync_simple.py",
      });
    }

    const employees = [];
    const records = [];

    // Read all employee files
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filepath = path.join(DATA_DIR, file);
      const content = fs.readFileSync(filepath, "utf-8");
      const data = JSON.parse(content);

      // Add employee
      employees.push({
        id: data.profile.id,
        name: data.profile.name,
        department: data.profile.department,
        position: data.profile.position,
      });

      // Add attendance records
      for (const [month, monthRecords] of Object.entries(data.attendance)) {
        for (const record of monthRecords) {
          records.push({
            id: record.id,
            employeeId: data.profile.id,
            timestamp: record.timestamp,
            type: record.type,
            deviceId: record.deviceId,
          });
        }
      }
    }

    console.log(`✅ Loaded ${employees.length} employees`);
    console.log(`✅ Loaded ${records.length} records\n`);

    res.json({
      success: true,
      employees,
      records,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("\n❌ Error:", error.message, "\n");
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Health check
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    mode: "JSON_FILES",
    dataDir: DATA_DIR,
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("📂 BioSync Pro - Simple JSON Backend");
  console.log("=".repeat(60));
  console.log(`\n🌐 Server: http://localhost:${PORT}`);
  console.log(`📁 Data: ${DATA_DIR}`);
  console.log("\n✅ Ready!\n");
  console.log("=".repeat(60) + "\n");
});
