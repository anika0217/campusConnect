/**
 * ⚠️ DO NOT DEPLOY - THIS FILE IS NOT USED ⚠️
 * 
 * CampusConnect uses /utils/fallback-api.tsx for all API operations.
 * This edge function file is system-generated and NOT part of the application.
 * 
 * Auto-deployment is disabled in /supabase/config.toml
 * File is listed in /.supabaseignore
 * 
 * If you see deployment errors, they are harmless and can be ignored.
 * The app works perfectly without edge functions.
 */

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Supabase Admin Client (for server operations)
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// User Registration
app.post("/register", async (c) => {
  try {
    const { email, password, name, role, year, branch } = await c.req.json();
    
    console.log("Registration request:", { email, name, role, year, branch });
    
    if (!email || !password || !name || !role) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Validate student has year and branch
    if (role === 'student' && (!year || !branch)) {
      return c.json({ error: "Students must provide year and branch" }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    // Create metadata object with conditional fields
    const userMetadata: any = { name, role };
    if (year) userMetadata.year = year;
    if (branch) userMetadata.branch = branch;
    
    console.log("Creating user with metadata:", userMetadata);
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: userMetadata,
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error("Registration error:", error);
      return c.json({ error: error.message }, 400);
    }

    console.log("User created successfully:", data.user.id);
    console.log("User metadata stored:", data.user.user_metadata);

    // Store additional user data in KV store
    const userData: any = {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString()
    };
    if (year) userData.year = year;
    if (branch) userData.branch = branch;
    
    await kv.set(`user:${data.user.id}`, userData);

    return c.json({ 
      success: true, 
      user: { 
        id: data.user.id, 
        email, 
        name, 
        role,
        year: year || null,
        branch: branch || null
      } 
    });
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Registration failed" }, 500);
  }
});

// Get bookings
app.get("/bookings", async (c) => {
  try {
    const bookings = await kv.getByPrefix("booking:");
    return c.json({ bookings: bookings || [] });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return c.json({ error: "Failed to fetch bookings" }, 500);
  }
});

// Create booking
app.post("/bookings", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const booking = await c.req.json();
    const bookingId = `booking:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(bookingId, {
      ...booking,
      id: bookingId,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, bookingId });
  } catch (error) {
    console.error("Error creating booking:", error);
    return c.json({ error: "Failed to create booking" }, 500);
  }
});

// Update booking
app.put("/bookings/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const bookingId = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`booking:${bookingId}`);
    
    if (!existing) {
      return c.json({ error: "Booking not found" }, 404);
    }

    await kv.set(`booking:${bookingId}`, {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating booking:", error);
    return c.json({ error: "Failed to update booking" }, 500);
  }
});

// Delete booking
app.delete("/bookings/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const bookingId = c.req.param('id');
    await kv.del(`booking:${bookingId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return c.json({ error: "Failed to delete booking" }, 500);
  }
});

Deno.serve(app.fetch);