import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import taxonomyRoutes from "./routes/taxonomy.js";
import matchRoutes from "./routes/matches.js";
import exchangeRoutes from "./routes/exchanges.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.use(cors({ origin: true, credentials: true, exposedHeaders: ["X-Total-Count"] }));
app.use(express.json({ limit: "200kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "skillswap-malawi-api" });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/taxonomy", taxonomyRoutes);
app.use("/matches", matchRoutes);
app.use("/exchanges", exchangeRoutes);
app.use("/admin", adminRoutes);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
