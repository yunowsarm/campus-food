import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;

connectDB()
  .then(async () => {
    const cron = await import("./utils/expiredGroupCron.js");
    const mod = cron.default || cron;
    if (mod && mod.start) mod.start();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start:", err);
    process.exit(1);
  });
