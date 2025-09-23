// src/data/featuresConfig.ts
import { Wifi, AirVent, Umbrella, Trees as Tree, Camera, Bed, Sofa, Briefcase, ShowerHead, Scissors, Bath, Clock, CalendarClock, Flame, Refrigerator, Coffee, UtensilsCrossed, Utensils, PawPrint, Key, Users, Home, Users2, Luggage, Cigarette, Siren as Fire, DollarSign, Stars as Stairs, Armchair as Wheelchair } from 'lucide-react';

export const FEATURES_CONFIG = {
  special: {
    title: 'Special Features',
    items: {
      internet: { icon: Wifi, label: 'Internet', type: 'text', placeholder: '50-60 Mbps', default: '50-60 Mbps' },
      airConditioned: { icon: AirVent, label: 'Air-Conditioned', type: 'boolean', default: true },
      privateTerrace: { icon: Umbrella, label: 'Private Terrace', type: 'boolean', default: true },
      gardenAccess: { icon: Tree, label: 'Garden Access', type: 'boolean', default: true },
      cctv: { icon: Camera, label: 'CCTV', type: 'boolean', default: true }
    }
  },
  bedroom: {
    title: 'Bedroom',
    items: {
      kingBeds: { icon: Bed, label: 'King Beds', type: 'number', default: 1 },
      queenBeds: { icon: Bed, label: 'Queen Beds', type: 'number', default: 0 },
      sofaBeds: { icon: Sofa, label: 'Sofa Beds', type: 'number', default: 1 },
      closetStorage: { icon: Briefcase, label: 'Closet / Storage', type: 'boolean', default: true },
      workDesk: { icon: Briefcase, label: 'Work Desk', type: 'boolean', default: true }
    }
  },
  bathroom: {
    title: 'Bathroom',
    items: {
      showers: { icon: ShowerHead, label: 'Showers', type: 'number', default: 1 },
      hairDryer: { icon: Scissors, label: 'Hair Dryer', type: 'boolean', default: true },
      toiletries: { icon: Bath, label: 'Toiletries', type: 'boolean', default: true },
      towelChangeFrequency: { icon: Clock, label: 'Towel Change Frequency (days)', type: 'number', default: 4 },
      bedSheetChangeFrequency: { icon: CalendarClock, label: 'Bed Sheet Change Frequency (days)', type: 'number', default: 4 }
    }
  },
  kitchen: {
    title: 'Kitchen',
    items: {
      stoveOven: { icon: Flame, label: 'Stove + Oven', type: 'boolean', default: true },
      refrigeratorFreezer: { icon: Refrigerator, label: 'Refrigerator + Freezer', type: 'boolean', default: true },
      coffeeMaker: { icon: Coffee, label: 'Coffee Maker', type: 'boolean', default: true },
      riceCooker: { icon: UtensilsCrossed, label: 'Rice Cooker', type: 'boolean', default: true },
      cutleryPlates: { icon: Utensils, label: 'Cutlery & Plates', type: 'boolean', default: true }
    }
  },
  general: {
    title: 'General',
    items: {
      petsAllowed: { icon: PawPrint, label: 'Pets Allowed', type: 'boolean', default: false },
      selfCheckIn: { icon: Key, label: 'Self Check-In', type: 'boolean', default: true },
      staffOnSite: { icon: Users, label: 'Staff on Site', type: 'boolean', default: true },
      longTermRental: { icon: Home, label: 'Long-Term Rental Available', type: 'boolean', default: true }
    }
  },
  optional: {
    title: 'Optional',
    items: {
      maxGuests: { icon: Users2, label: 'Max Guests', type: 'number', default: 4 },
      luggageDropOff: { icon: Luggage, label: 'Luggage Drop-Off', type: 'boolean', default: true },
      smokeAlarm: { icon: Cigarette, label: 'Smoke Alarm', type: 'boolean', default: true },
      fireExtinguisher: { icon: Fire, label: 'Fire Extinguisher', type: 'boolean', default: true },
      cleaningFee: { icon: DollarSign, label: 'Cleaning Fee Applies', type: 'boolean', default: true },
      stairsElevator: { icon: Stairs, label: 'Access via', type: 'select', options: ['Stairs', 'Elevator'], default: 'Stairs' },
      wheelchairAccessible: { icon: Wheelchair, label: 'Wheelchair Accessible', type: 'boolean', default: false }
    }
  }
};
