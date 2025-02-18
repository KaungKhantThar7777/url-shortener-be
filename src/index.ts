import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";
import cors from "cors";
dotenv.config();

const supabase = createClient<Database>(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || ""
);

const app = express();

app.use(express.json());

app.use(cors());

app.post("/api/url", async (req, res) => {
  const { url, domain } = req.body;
  const { nanoid } = await import("nanoid");

  const { data, error } = await supabase
    .from("urls")
    .insert({
      url,
      domain,
      shortened: nanoid(6),
    })
    .select();

  if (error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(200).json({ data });
  }
});

app.get("/api/url/:shortened", async (req, res) => {
  const { shortened } = req.params;

  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("shortened", shortened);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (!data || data.length === 0) {
    res.status(404).json({ error: "URL not found" });
    return;
  }
  res.json({ data });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
