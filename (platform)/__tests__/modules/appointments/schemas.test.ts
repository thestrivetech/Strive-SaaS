import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
  calendarFiltersSchema,
  appointmentTypeSchema,
  appointmentStatusSchema,
} from '@/lib/modules/appointments/schemas';

describe('Appointments Schemas', () => {
  describe('appointmentTypeSchema', () => {
    it('should validate correct appointment types', () => {
      expect(appointmentTypeSchema.parse('MEETING')).toBe('MEETING');
      expect(appointmentTypeSchema.parse('CALL')).toBe('CALL');
      expect(appointmentTypeSchema.parse('SHOWING')).toBe('SHOWING');
      expect(appointmentTypeSchema.parse('OPEN_HOUSE')).toBe('OPEN_HOUSE');
      expect(appointmentTypeSchema.parse('FOLLOW_UP')).toBe('FOLLOW_UP');
      expect(appointmentTypeSchema.parse('OTHER')).toBe('OTHER');
    });

    it('should reject invalid appointment types', () => {
      expect(() => appointmentTypeSchema.parse('INVALID')).toThrow();
    });
  });

  describe('createAppointmentSchema', () => {
    const validAppointment = {
      title: 'Meeting with client',
      description: 'Discuss project requirements',
      start_time: new Date('2025-10-05T10:00:00Z'),
      end_time: new Date('2025-10-05T11:00:00Z'),
      location: '123 Main St',
      type: 'MEETING' as const,
      status: 'SCHEDULED' as const,
    };

    it('should validate valid appointment data', () => {
      const result = createAppointmentSchema.parse(validAppointment);
      expect(result.title).toBe('Meeting with client');
      expect(result.type).toBe('MEETING');
    });

    it('should require title with minimum length', () => {
      expect(() =>
        createAppointmentSchema.parse({ ...validAppointment, title: 'A' })
      ).toThrow();
    });

    it('should enforce end time after start time', () => {
      expect(() =>
        createAppointmentSchema.parse({
          ...validAppointment,
          end_time: new Date('2025-10-05T09:00:00Z'),
        })
      ).toThrow();
    });

    it('should allow optional fields to be undefined', () => {
      const minimalAppointment = {
        title: 'Quick meeting',
        start_time: new Date('2025-10-05T10:00:00Z'),
        end_time: new Date('2025-10-05T11:00:00Z'),
      };

      const result = createAppointmentSchema.parse(minimalAppointment);
      expect(result.title).toBe('Quick meeting');
      expect(result.type).toBe('OTHER'); // default
    });
  });

  describe('calendarFiltersSchema', () => {
    it('should validate calendar filter with date range', () => {
      const filters = {
        start_date: new Date('2025-10-01'),
        end_date: new Date('2025-10-31'),
      };

      const result = calendarFiltersSchema.parse(filters);
      expect(result.start_date).toBeInstanceOf(Date);
      expect(result.end_date).toBeInstanceOf(Date);
    });

    it('should allow optional filter fields', () => {
      const filters = {
        start_date: new Date('2025-10-01'),
        end_date: new Date('2025-10-31'),
        type: 'MEETING' as const,
        status: 'SCHEDULED' as const,
      };

      const result = calendarFiltersSchema.parse(filters);
      expect(result.type).toBe('MEETING');
      expect(result.status).toBe('SCHEDULED');
    });
  });
});
