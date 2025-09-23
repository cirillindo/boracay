import React from 'react';
import { Wifi, AirVent, Umbrella, Trees as Tree, Camera, Bed, Sofa, Briefcase, ShowerHead, Scissors, Bath, Clock, CalendarClock, Flame, Refrigerator, Coffee, UtensilsCrossed, Utensils, PawPrint, Key, Users, Home, Users2, Luggage, Cigarette, Siren as Fire, DollarSign, Stars as Stairs, Armchair as Wheelchair, Check } from 'lucide-react';
import clsx from 'clsx';

interface Tab {
  id: string;
  label: string;
}

interface PropertyTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  description: string;
  features?: {
    special?: {
      internet?: string;
      airConditioned?: boolean;
      privateTerrace?: boolean;
      gardenAccess?: boolean;
      cctv?: boolean;
    };
    bedroom?: {
      kingBeds?: number;
      queenBeds?: number;
      sofaBeds?: number;
      closetStorage?: boolean;
      workDesk?: boolean;
    };
    bathroom?: {
      showers?: number;
      hairDryer?: boolean;
      toiletries?: boolean;
      towelChangeFrequency?: number;
      bedSheetChangeFrequency?: number;
    };
    kitchen?: {
      stoveOven?: boolean;
      refrigeratorFreezer?: boolean;
      coffeeMaker?: boolean;
      riceCooker?: boolean;
      cutleryPlates?: boolean;
    };
    general?: {
      petsAllowed?: boolean;
      selfCheckIn?: boolean;
      staffOnSite?: boolean;
      longTermRental?: boolean;
    };
    optional?: {
      maxGuests?: number;
      luggageDropOff?: boolean;
      smokeAlarm?: boolean;
      fireExtinguisher?: boolean;
      cleaningFee?: boolean;
      stairsElevator?: 'Stairs' | 'Elevator';
      wheelchairAccessible?: boolean;
    };
  };
  earningsInfo?: string;
  legalInfo?: string;
  policy?: {
    mandatoryServices?: {
      name: string;
      value: string;
    }[];
    schedule?: {
      checkIn: string;
      checkOut: string;
    };
    cancellation?: {
      policies: {
        period: string;
        charge: string;
      }[];
    };
  };
}

const tabs: Tab[] = [
  { id: 'description', label: 'DESCRIPTION' },
  { id: 'features', label: 'FEATURES' },
  { id: 'earnings', label: 'EARNINGS' },
  { id: 'legal', label: 'LEGAL' },
  { id: 'policy', label: 'POLICY' }
];

const featureMap = {
  special: {
    title: 'Special Features',
    items: {
      internet: { icon: Wifi, label: 'Internet', hasValue: true },
      airConditioned: { icon: AirVent, label: 'Air-Conditioned' },
      privateTerrace: { icon: Umbrella, label: 'Private Terrace' },
      gardenAccess: { icon: Tree, label: 'Garden Access' },
      cctv: { icon: Camera, label: 'CCTV' }
    }
  },
  bedroom: {
    title: 'Bedroom',
    items: {
      kingBeds: { icon: Bed, label: 'King Beds', hasValue: true },
      queenBeds: { icon: Bed, label: 'Queen Beds', hasValue: true },
      sofaBeds: { icon: Sofa, label: 'Sofa Beds', hasValue: true },
      closetStorage: { icon: Briefcase, label: 'Closet / Storage' },
      workDesk: { icon: Briefcase, label: 'Work Desk' }
    }
  },
  bathroom: {
    title: 'Bathroom',
    items: {
      showers: { icon: ShowerHead, label: 'Showers', hasValue: true },
      hairDryer: { icon: Scissors, label: 'Hair Dryer' },
      toiletries: { icon: Bath, label: 'Toiletries' },
      towelChangeFrequency: { icon: Clock, label: 'Towel Change Every', hasValue: true, suffix: ' days' },
      bedSheetChangeFrequency: { icon: CalendarClock, label: 'Bed Sheet Change Every', hasValue: true, suffix: ' days' }
    }
  },
  kitchen: {
    title: 'Kitchen',
    items: {
      stoveOven: { icon: Flame, label: 'Stove + Oven' },
      refrigeratorFreezer: { icon: Refrigerator, label: 'Refrigerator + Freezer' },
      coffeeMaker: { icon: Coffee, label: 'Coffee Maker' },
      riceCooker: { icon: UtensilsCrossed, label: 'Rice Cooker' },
      cutleryPlates: { icon: Utensils, label: 'Cutlery & Plates' }
    }
  },
  general: {
    title: 'General',
    items: {
      petsAllowed: { icon: PawPrint, label: 'Pets Allowed' },
      selfCheckIn: { icon: Key, label: 'Self Check-In' },
      staffOnSite: { icon: Users, label: 'Staff on Site' },
      longTermRental: { icon: Home, label: 'Long-Term Rental Available' }
    }
  },
  optional: {
    title: 'Optional',
    items: {
      maxGuests: { icon: Users2, label: 'Max Guests', hasValue: true },
      luggageDropOff: { icon: Luggage, label: 'Luggage Drop-Off' },
      smokeAlarm: { icon: Cigarette, label: 'Smoke Alarm' },
      fireExtinguisher: { icon: Fire, label: 'Fire Extinguisher' },
      cleaningFee: { icon: DollarSign, label: 'Cleaning Fee Applies' },
      stairsElevator: { icon: Stairs, label: 'Access via', hasValue: true },
      wheelchairAccessible: { icon: Wheelchair, label: 'Wheelchair Accessible' }
    }
  }
};

const PropertyTabs: React.FC<PropertyTabsProps> = ({
  activeTab,
  onTabChange,
  description,
  features,
  earningsInfo = '',
  legalInfo = '',
  policy
}) => {
  console.log('[PropertyTabs] earningsInfo:', earningsInfo);
  console.log('[PropertyTabs] legalInfo:', legalInfo);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex-1 py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold transition-all duration-300 relative overflow-hidden whitespace-nowrap min-w-0',
              activeTab === tab.id
                ? 'bg-primary-50 text-primary-900 tab-pulse'
                : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
            )}
          >
            <span className="truncate">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary animate-tab-slide" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'description' && (
          <div className="overflow-x-auto">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          </div>
        )}

        {activeTab === 'features' && features && (
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(featureMap).map(([category, { title, items }]) => {
              const categoryFeatures = features[category as keyof typeof features];
              if (!categoryFeatures) return null;

              return (
                <div key={category}>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    {title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Object.entries(items).map(([key, { icon: Icon, label, hasValue, suffix }]) => {
                      const value = categoryFeatures[key as keyof typeof categoryFeatures];
                      if (value === undefined || value === false) return null;

                      return (
                        <div
                          key={key}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                          <span className="text-sm sm:text-base text-gray-700">
                            {hasValue ? `${label}: ${value}${suffix || ''}` : label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="overflow-x-auto">
            <div className="prose max-w-none">
              {earningsInfo ? (
                <div dangerouslySetInnerHTML={{ __html: earningsInfo }} />
              ) : (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">Earnings Information</h3>
                  <p className="text-sm sm:text-base">No earnings information available for this property.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="overflow-x-auto">
            <div className="prose max-w-none">
              {legalInfo ? (
                <div dangerouslySetInnerHTML={{ __html: legalInfo }} />
              ) : (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <Check className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">Legal Information</h3>
                  <p className="text-sm sm:text-base">No legal information available for this property.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'policy' && policy && (
          <div className="space-y-6 sm:space-y-8">
            {/* Mandatory Services */}
            {policy.mandatoryServices && policy.mandatoryServices.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Mandatory or included services
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {policy.mandatoryServices.map((service, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm sm:text-base text-gray-700">
                        {service.name}: {service.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule */}
            {policy.schedule && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Your Schedule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">Check-in</div>
                    <div className="text-gray-600 text-sm sm:text-base">{policy.schedule.checkIn}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">Check-out</div>
                    <div className="text-gray-600 text-sm sm:text-base">{policy.schedule.checkOut}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            {policy.cancellation && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Cancellation policy
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  In case of cancellation the following charges will apply
                </p>
                <div className="space-y-2">
                  {policy.cancellation.policies.map((policy, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-gray-600 text-sm sm:text-base">
                        {policy.period}: <span className="font-semibold">{policy.charge}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyTabs;