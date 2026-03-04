import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'agent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'admin' | 'agent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'agent'
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          make: string
          model: string
          year: number
          price: number
          mileage: number
          description: string
          transmission: string
          fuel_type: string
          drivetrain: string
          color: string
          interior_color: string | null
          condition: string
          body_type: string
          engine_size: string | null
          doors: number
          seats: number
          cylinders: number
          vin: string | null
          license_plate: string | null
          registration_date: string | null
          warranty: boolean
          warranty_expiry: string | null
          service_history: boolean
          finance_available: boolean
          estimated_monthly_payment: number | null
          images: string[]
          featured: boolean
          status: string
          created_by: string
          created_at: string
          updated_at: string
          
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
          isofix: boolean
          
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
          
          // Vehicle History
          warranty_remaining: boolean
          owners_count: number
        }
        Insert: {
          id?: string
          make: string
          model: string
          year: number
          price: number
          mileage: number
          description: string
          transmission: string
          fuel_type: string
          drivetrain: string
          color: string
          interior_color?: string | null
          condition: string
          body_type: string
          engine_size?: string | null
          doors: number
          seats: number
          cylinders: number
          vin?: string | null
          license_plate?: string | null
          registration_date?: string | null
          warranty?: boolean
          warranty_expiry?: string | null
          service_history?: boolean
          finance_available?: boolean
          estimated_monthly_payment?: number | null
          images?: string[]
          featured?: boolean
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
          
          // Safety Features
          abs?: boolean
          airbags?: number
          traction_control?: boolean
          stability_control?: boolean
          hill_assist?: boolean
          lane_assist?: boolean
          blind_spot_monitor?: boolean
          rear_cross_traffic?: boolean
          adaptive_cruise?: boolean
          auto_emergency_brake?: boolean
          alarm_system?: boolean
          immobilizer?: boolean
          central_locking?: boolean
          isofix?: boolean
          
          // Comfort Features
          aircon?: boolean
          climate_control?: boolean
          rear_ac?: boolean
          cruise_control?: boolean
          power_steering?: boolean
          electric_seats?: boolean
          memory_seats?: boolean
          heated_seats?: boolean
          leather_seats?: boolean
          
          // Technology Features
          bluetooth?: boolean
          usb_port?: boolean
          aux_input?: boolean
          touchscreen?: boolean
          navigation?: boolean
          multimedia_system?: boolean
          apple_carplay?: boolean
          android_auto?: boolean
          reverse_camera?: boolean
          parking_sensors?: boolean
          
          // Convenience Features
          electric_windows?: boolean
          electric_mirrors?: boolean
          keyless_entry?: boolean
          keyless_start?: boolean
          sunroof?: boolean
          panoramic_roof?: boolean
          paddle_shifters?: boolean
          sport_mode?: boolean
          eco_mode?: boolean
          
          // Exterior Features
          alloy_wheels?: boolean
          fog_lights?: boolean
          xenon_lights?: boolean
          led_lights?: boolean
          daytime_running_lights?: boolean
          tow_bar?: boolean
          roof_rails?: boolean
          
          // Vehicle History
          warranty_remaining?: boolean
          owners_count?: number
        }
        Update: {
          id?: string
          make?: string
          model?: string
          year?: number
          price?: number
          mileage?: number
          description?: string
          transmission?: string
          fuel_type?: string
          drivetrain?: string
          color?: string
          interior_color?: string | null
          condition?: string
          body_type?: string
          engine_size?: string | null
          doors?: number
          seats?: number
          cylinders?: number
          vin?: string | null
          license_plate?: string | null
          registration_date?: string | null
          warranty?: boolean
          warranty_expiry?: string | null
          service_history?: boolean
          finance_available?: boolean
          estimated_monthly_payment?: number | null
          images?: string[]
          featured?: boolean
          status?: string
          updated_at?: string
          
          // Safety Features
          abs?: boolean
          airbags?: number
          traction_control?: boolean
          stability_control?: boolean
          hill_assist?: boolean
          lane_assist?: boolean
          blind_spot_monitor?: boolean
          rear_cross_traffic?: boolean
          adaptive_cruise?: boolean
          auto_emergency_brake?: boolean
          alarm_system?: boolean
          immobilizer?: boolean
          central_locking?: boolean
          isofix?: boolean
          
          // Comfort Features
          aircon?: boolean
          climate_control?: boolean
          rear_ac?: boolean
          cruise_control?: boolean
          power_steering?: boolean
          electric_seats?: boolean
          memory_seats?: boolean
          heated_seats?: boolean
          leather_seats?: boolean
          
          // Technology Features
          bluetooth?: boolean
          usb_port?: boolean
          aux_input?: boolean
          touchscreen?: boolean
          navigation?: boolean
          multimedia_system?: boolean
          apple_carplay?: boolean
          android_auto?: boolean
          reverse_camera?: boolean
          parking_sensors?: boolean
          
          // Convenience Features
          electric_windows?: boolean
          electric_mirrors?: boolean
          keyless_entry?: boolean
          keyless_start?: boolean
          sunroof?: boolean
          panoramic_roof?: boolean
          paddle_shifters?: boolean
          sport_mode?: boolean
          eco_mode?: boolean
          
          // Exterior Features
          alloy_wheels?: boolean
          fog_lights?: boolean
          xenon_lights?: boolean
          led_lights?: boolean
          daytime_running_lights?: boolean
          tow_bar?: boolean
          roof_rails?: boolean
          
          // Vehicle History
          warranty_remaining?: boolean
          owners_count?: number
        }
      }
      hero_carousel: {
        Row: {
          id: string
          title: string
          subtitle: string
          image_url: string
          order_index: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle: string
          image_url: string
          order_index: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string
          image_url?: string
          order_index?: number
          active?: boolean
          updated_at?: string
        }
      }
    }
  }
}