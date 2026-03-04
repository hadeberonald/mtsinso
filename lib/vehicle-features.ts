// lib/vehicle-features.ts

export const COLORS = [
  'White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Green', 
  'Yellow', 'Orange', 'Brown', 'Beige', 'Gold', 'Bronze'
]

export const BODY_TYPES = [
  'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 
  'Wagon', 'Bakkie', 'Van', 'Minibus', 'Crossover'
]

export const MAKES = [
  'Toyota', 'Ford', 'Volkswagen', 'Nissan', 'BMW', 'Mercedes-Benz',
  'Audi', 'Hyundai', 'Kia', 'Mazda', 'Honda', 'Isuzu', 'Renault',
  'Peugeot', 'Jeep', 'Land Rover', 'Volvo', 'Mahindra', 'Suzuki',
  'Mitsubishi', 'Chevrolet', 'Haval', 'GWM', 'Chery', 'JAC', 'Other'
]

export const FUEL_TYPES = [
  'Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'Hydrogen'
]

export const TRANSMISSIONS = [
  'Automatic', 'Manual', 'Semi-Automatic', 'CVT', 'DCT'
]

export interface VehicleFeatures {
  // Safety Features
  abs: boolean
  airbags: number
  traction_control: boolean
  stability_control: boolean
  hill_assist: boolean
  lane_assist: boolean
  blind_spot_monitor: boolean
  rear_cross_traffic: boolean
  adaptive_cruise: boolean
  auto_emergency_brake: boolean
  alarm_system: boolean
  immobilizer: boolean
  central_locking: boolean
  
  // Comfort Features
  aircon: boolean
  climate_control: boolean
  rear_ac: boolean
  cruise_control: boolean
  power_steering: boolean
  electric_seats: boolean
  memory_seats: boolean
  heated_seats: boolean
  leather_seats: boolean
  
  // Technology Features
  bluetooth: boolean
  usb_port: boolean
  aux_input: boolean
  touchscreen: boolean
  navigation: boolean
  multimedia_system: boolean
  apple_carplay: boolean
  android_auto: boolean
  reverse_camera: boolean
  parking_sensors: boolean
  
  // Convenience Features
  electric_windows: boolean
  electric_mirrors: boolean
  keyless_entry: boolean
  keyless_start: boolean
  sunroof: boolean
  panoramic_roof: boolean
  paddle_shifters: boolean
  sport_mode: boolean
  eco_mode: boolean
  
  // Exterior Features
  alloy_wheels: boolean
  fog_lights: boolean
  xenon_lights: boolean
  led_lights: boolean
  daytime_running_lights: boolean
  tow_bar: boolean
  roof_rails: boolean
  
  // Vehicle Info
  service_history: boolean
  owners_count: number
  warranty_remaining: boolean
  isofix: boolean
}

export const FEATURE_CATEGORIES = {
  safety: {
    title: 'Safety & Security',
    features: [
      { key: 'abs', label: 'ABS (Anti-lock Braking System)' },
      { key: 'traction_control', label: 'Traction Control' },
      { key: 'stability_control', label: 'Stability Control' },
      { key: 'hill_assist', label: 'Hill Start Assist' },
      { key: 'lane_assist', label: 'Lane Keeping Assist' },
      { key: 'blind_spot_monitor', label: 'Blind Spot Monitor' },
      { key: 'rear_cross_traffic', label: 'Rear Cross Traffic Alert' },
      { key: 'adaptive_cruise', label: 'Adaptive Cruise Control' },
      { key: 'auto_emergency_brake', label: 'Auto Emergency Braking' },
      { key: 'alarm_system', label: 'Alarm System' },
      { key: 'immobilizer', label: 'Immobilizer' },
      { key: 'central_locking', label: 'Central Locking' },
      { key: 'isofix', label: 'ISOFIX Child Seat Anchors' },
    ]
  },
  comfort: {
    title: 'Comfort & Interior',
    features: [
      { key: 'aircon', label: 'Air Conditioning' },
      { key: 'climate_control', label: 'Climate Control' },
      { key: 'rear_ac', label: 'Rear A/C Vents' },
      { key: 'cruise_control', label: 'Cruise Control' },
      { key: 'power_steering', label: 'Power Steering' },
      { key: 'electric_seats', label: 'Electric Seats' },
      { key: 'memory_seats', label: 'Memory Seats' },
      { key: 'heated_seats', label: 'Heated Seats' },
      { key: 'leather_seats', label: 'Leather Seats' },
    ]
  },
  technology: {
    title: 'Technology & Entertainment',
    features: [
      { key: 'bluetooth', label: 'Bluetooth' },
      { key: 'usb_port', label: 'USB Port' },
      { key: 'aux_input', label: 'AUX Input' },
      { key: 'touchscreen', label: 'Touchscreen Display' },
      { key: 'navigation', label: 'Navigation System' },
      { key: 'multimedia_system', label: 'Multimedia System' },
      { key: 'apple_carplay', label: 'Apple CarPlay' },
      { key: 'android_auto', label: 'Android Auto' },
      { key: 'reverse_camera', label: 'Reverse Camera' },
      { key: 'parking_sensors', label: 'Parking Sensors' },
    ]
  },
  convenience: {
    title: 'Convenience Features',
    features: [
      { key: 'electric_windows', label: 'Electric Windows' },
      { key: 'electric_mirrors', label: 'Electric Mirrors' },
      { key: 'keyless_entry', label: 'Keyless Entry' },
      { key: 'keyless_start', label: 'Keyless Start / Push Button' },
      { key: 'sunroof', label: 'Sunroof' },
      { key: 'panoramic_roof', label: 'Panoramic Roof' },
      { key: 'paddle_shifters', label: 'Paddle Shifters' },
      { key: 'sport_mode', label: 'Sport Mode' },
      { key: 'eco_mode', label: 'Eco Mode' },
    ]
  },
  exterior: {
    title: 'Exterior Features',
    features: [
      { key: 'alloy_wheels', label: 'Alloy Wheels' },
      { key: 'fog_lights', label: 'Fog Lights' },
      { key: 'xenon_lights', label: 'Xenon Headlights' },
      { key: 'led_lights', label: 'LED Headlights' },
      { key: 'daytime_running_lights', label: 'Daytime Running Lights' },
      { key: 'tow_bar', label: 'Tow Bar' },
      { key: 'roof_rails', label: 'Roof Rails' },
    ]
  },
  history: {
    title: 'Vehicle History',
    features: [
      { key: 'service_history', label: 'Full Service History' },
      { key: 'warranty_remaining', label: 'Warranty Remaining' },
    ]
  }
}