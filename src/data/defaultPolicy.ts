// src/data/defaultPolicy.ts
export const DEFAULT_POLICY = {
  mandatoryServices: [
    {
      name: 'Final Cleaning',
      value: 'PHP 1,000 to 1,500 / Booking (depending on room size)'
    },
    {
      name: 'Linen & Towel Change',
      value: 'Every 4 days'
    },
    {
      name: 'Extra Linen/Towel Refresh',
      value: 'PHP 500 (upon request)'
    },
    {
      name: 'No Pets Allowed',
      value: 'Not permitted'
    },
    {
      name: 'Credit Card / PayPal Transaction Fee',
      value: '4.5% of total booking'
    },
    {
      name: 'Date Alteration',
      value: 'Not Allowed for Promo Rates'
    }
  ],
  schedule: {
    checkIn: 'From 14:00 to 00:00 — Every day',
    checkOut: 'Before 11:00'
  },
  cancellation: {
    policies: [
      {
        period: '14+ days before check-in',
        charge: 'Full refund'
      },
      {
        period: '7–14 days before check-in',
        charge: '50% refund'
      },
      {
        period: 'Less than 7 days before check-in',
        charge: 'No refund'
      },
      {
        period: 'Promo Rates',
        charge: 'Always non-refundable'
      }
    ]
  }
};
