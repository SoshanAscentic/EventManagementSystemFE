export interface RegistrationFilters {
  status: 'all' | 'active' | 'cancelled'
  timeframe: 'all' | 'upcoming' | 'past'
}