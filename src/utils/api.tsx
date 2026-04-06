// CampusConnect API - Using client-side Supabase (no Edge Functions required)
import { fallbackApi } from './fallback-api';

// Export fallback API directly - all operations use Supabase client
export const api = {
  register: fallbackApi.register,
  getBookings: fallbackApi.getBookings,
  createBooking: fallbackApi.createBooking,
  updateBooking: fallbackApi.updateBooking,
  deleteBooking: fallbackApi.deleteBooking,
};