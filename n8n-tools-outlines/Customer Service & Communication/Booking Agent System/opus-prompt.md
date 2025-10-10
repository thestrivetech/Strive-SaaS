Prompt #21: Intelligent Booking Agent System (Enhanced)
Role
N8n Real Estate Scheduling Automation Architect with expertise in calendar APIs, conflict resolution algorithms, and multi-agent coordination systems
Context

Volume: 500-2,000 appointment requests per month per office
Performance: Booking confirmation < 3 seconds, availability check < 500ms
Integration: Google Calendar, Outlook, Calendly, Zoom, property showing apps
Compliance: TCPA regulations for automated communications, ADA accessibility
Scale: Support 50 agents initially, scaling to 500 agents within 12 months

Primary Objective
Reduce appointment scheduling time by 85% while achieving 99.5% booking accuracy and zero double-bookings
Enhanced Requirements
Calendar Integration & Availability Management

Real-time Multi-Calendar Synchronization

javascript// N8n Function Node - Calendar Availability Checker
const checkAvailability = async (agentId, requestedTime, duration) => {
  const calendars = [
    { type: 'google', id: $node["Google Calendar"].json.calendarId },
    { type: 'outlook', id: $node["Outlook"].json.calendarId },
    { type: 'internal', id: $node["CRM"].json.agentCalendarId }
  ];
  
  const conflicts = await Promise.all(calendars.map(async (cal) => {
    const events = await $node[`${cal.type}Calendar`].getEvents({
      timeMin: requestedTime,
      timeMax: new Date(requestedTime.getTime() + duration * 60000),
      singleEvents: true
    });
    
    return events.items.filter(event => 
      event.status !== 'cancelled' &&
      event.transparency !== 'transparent'
    );
  }));
  
  const bufferTime = 15; // minutes between appointments
  const travelTime = await calculateTravelTime(
    $node["Previous"].json.location,
    $node["Current"].json.location
  );
  
  return {
    available: conflicts.flat().length === 0,
    conflicts: conflicts.flat(),
    suggestedAlternatives: await findAlternativeSlots(agentId, requestedTime, duration),
    travelTimeRequired: travelTime
  };
};
Architecture Decision:

Approach: Event-sourcing pattern for calendar state management
Rationale: Ensures consistency across multiple calendar systems
Alternatives considered: Direct API polling (too slow), webhook-only (missed events risk)
Trade-offs: Higher complexity but guarantees data consistency

Intelligent Appointment Matching

Client Preference Learning System

python# N8n Code Node - Preference Matching Algorithm
def match_appointment_preferences(client_data, available_slots):
    """
    ML-based preference matching using historical booking patterns
    """
    preferences = {
        'time_of_day': extract_time_preference(client_data['booking_history']),
        'day_of_week': extract_day_preference(client_data['booking_history']),
        'agent_preference': client_data.get('preferred_agents', []),
        'property_type': client_data.get('property_interests', []),
        'communication_method': client_data.get('preferred_contact', 'email')
    }
    
    scored_slots = []
    for slot in available_slots:
        score = calculate_preference_score(slot, preferences)
        
        # Apply weighted scoring
        score *= 1.2 if slot['agent_id'] in preferences['agent_preference'] else 1.0
        score *= 1.1 if matches_time_preference(slot, preferences['time_of_day']) else 1.0
        score *= 0.8 if requires_travel_time(slot) > 30 else 1.0
        
        scored_slots.append({
            'slot': slot,
            'score': score,
            'match_reasons': generate_match_explanation(slot, preferences)
        })
    
    return sorted(scored_slots, key=lambda x: x['score'], reverse=True)[:5]
Technical Specifications
API Definition
typescriptinterface BookingRequest {
  clientId: string;
  propertyId?: string;
  appointmentType: 'showing' | 'consultation' | 'closing' | 'inspection';
  preferredTimes: TimeSlot[];
  duration: number; // minutes
  participants: Participant[];
  requirements: {
    inPerson: boolean;
    location?: Coordinates;
    virtualMeetingRequired?: boolean;
    documentsRequired?: string[];
  };
  urgency: 'immediate' | 'flexible' | 'scheduled';
}

interface BookingResponse {
  bookingId: string;
  status: 'confirmed' | 'pending' | 'waitlisted';
  appointment: {
    startTime: Date;
    endTime: Date;
    location: Location;
    agent: AgentInfo;
    meetingLink?: string;
  };
  confirmationChannels: string[];
  alternativeSlots?: TimeSlot[];
  estimatedTravelTime?: number;
}

interface TimeSlot {
  start: Date;
  end: Date;
  preference: 1 | 2 | 3; // 1 = most preferred
}
Core Booking Algorithm
javascript// N8n Function Node - Main Booking Orchestrator
const processBookingRequest = async (request) => {
  // Step 1: Validate request
  const validation = await validateBookingRequest(request);
  if (!validation.valid) {
    return { error: validation.errors, status: 400 };
  }
  
  // Step 2: Find available agents
  const availableAgents = await findAvailableAgents({
    times: request.preferredTimes,
    propertyType: request.propertyId ? await getPropertyType(request.propertyId) : null,
    location: request.requirements.location,
    specializations: request.appointmentType
  });
  
  // Step 3: Score and rank options
  const scoredOptions = await scoreBookingOptions(
    availableAgents,
    request.clientId,
    request.preferredTimes
  );
  
  // Step 4: Attempt booking with conflict resolution
  let bookingResult = null;
  for (const option of scoredOptions) {
    try {
      bookingResult = await createBooking({
        agentId: option.agentId,
        clientId: request.clientId,
        timeSlot: option.timeSlot,
        duration: request.duration,
        type: request.appointmentType
      });
      
      if (bookingResult.success) break;
    } catch (error) {
      await logBookingFailure(error, option);
    }
  }
  
  // Step 5: Handle waitlist if no immediate booking
  if (!bookingResult || !bookingResult.success) {
    bookingResult = await addToWaitlist(request);
  }
  
  // Step 6: Send confirmations
  await sendMultiChannelConfirmation(bookingResult, request.clientId);
  
  return bookingResult;
};
Success Criteria
Performance Metrics

Response Time: P95 < 2s, P99 < 3s for booking confirmation
Throughput: 50 concurrent booking requests minimum
Availability: 99.9% uptime (43 minutes downtime/month max)
Resource Usage: CPU < 60%, Memory < 2GB per instance

Quality Metrics

Booking Success Rate: >95% on first attempt
Double-booking Rate: <0.01%
Client Satisfaction: >4.5/5 on booking experience
Agent Utilization: >75% of available time slots filled

Business Impact Metrics

Cost Savings: $3,500/month in admin time (70 hours @ $50/hour)
Time Saved: 45 minutes per booking reduced to 5 minutes
Revenue Impact: 15% increase in showings due to easier booking
No-show Rate: <5% with automated reminders

Testing Requirements
Unit Tests
javascriptdescribe('Booking Agent System Tests', () => {
  describe('Availability Checker', () => {
    test('should detect calendar conflicts correctly', async () => {
      // Arrange
      const mockCalendars = createMockCalendarData();
      const requestedTime = new Date('2024-11-20T14:00:00');
      
      // Act
      const result = await checkAvailability('agent123', requestedTime, 60);
      
      // Assert
      expect(result.available).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.suggestedAlternatives).toHaveLength(3);
    });
    
    test('should calculate travel time between appointments', async () => {
      // Arrange
      const location1 = { lat: 37.7749, lng: -122.4194 };
      const location2 = { lat: 37.7849, lng: -122.4094 };
      
      // Act
      const travelTime = await calculateTravelTime(location1, location2);
      
      // Assert
      expect(travelTime).toBeGreaterThan(10);
      expect(travelTime).toBeLessThan(30);
    });
  });
});
Integration Tests

Calendar sync across Google, Outlook, and internal systems
Notification delivery via email, SMS, and push
Video conferencing link generation and validation
CRM data synchronization

Load Tests

Simulate 100 concurrent booking requests
Sustain 500 bookings/hour for 2 hours
Measure calendar API rate limit handling
Test waitlist performance with 1000+ entries

Monitoring & Observability
yamldashboard:
  real_time_metrics:
    - metric: booking_success_rate
      threshold: > 95%
      alert: critical if < 90%
    
    - metric: double_booking_incidents
      threshold: 0
      alert: critical if > 0
    
    - metric: avg_booking_time
      threshold: < 3s
      alert: warning if > 5s
  
  business_metrics:
    - metric: daily_bookings
      baseline: 50
      target: 75
    
    - metric: no_show_rate
      threshold: < 5%
      alert: warning if > 8%
    
    - metric: agent_utilization
      target: > 75%
      alert: info if < 60%

logging:
  - level: INFO
    events: [booking_created, confirmation_sent, reminder_sent]
  - level: ERROR
    events: [double_booking_detected, calendar_sync_failed, notification_failed]
  - level: DEBUG
    events: [preference_calculation, travel_time_calculation, waitlist_processing]
Implementation Checklist

 Set up N8n instance with required nodes
 Configure Google Calendar API credentials
 Configure Outlook Graph API access
 Implement availability checking algorithm
 Create preference matching system
 Build conflict resolution logic
 Set up multi-channel notifications
 Implement waitlist management
 Create automated testing suite
 Configure monitoring dashboards
 Deploy to staging environment
 Conduct user acceptance testing
 Create agent training materials
 Deploy to production
 Monitor for 2 weeks post-launch