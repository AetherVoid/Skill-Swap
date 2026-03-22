import { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";

type Overview = {
  totalUsers: number;
  totalExchanges: number;
  completedExchanges: number;
  openDisputes: number;
};

const apiBase = import.meta.env.VITE_API_URL ?? "/api";

export function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    void fetch(`${apiBase}/admin/overview`, {
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json() as Promise<Overview>;
      })
      .then(setData)
      .catch((e: Error) => setErr(e.message));
  }, []);

  if (err) {
    return (
      <Card sx={{ m: 2 }}>
        <CardContent>
          <Typography color="error">Could not load overview: {err}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card sx={{ m: 2 }}>
        <CardContent>
          <Typography>Loading…</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: 16 }}>
      {[
        ["Registered users", data.totalUsers],
        ["Exchanges (all)", data.totalExchanges],
        ["Completed exchanges", data.completedExchanges],
        ["Open disputes", data.openDisputes],
      ].map(([label, value]) => (
        <Card key={String(label)} sx={{ minWidth: 200, flex: "1 1 180px" }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
