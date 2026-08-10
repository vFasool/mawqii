// Types يدوية مطابقة لملفات supabase/migrations/*.sql
// عند ربط مشروع Supabase حقيقي، يمكن استبدال هذا الملف بالكامل عبر:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts

export type BusinessType =
  | "restaurant"
  | "cafe"
  | "barbershop"
  | "car_wash"
  | "home_services";

export type WebsiteStatus = "draft" | "published";

export interface ServiceItem {
  name: string;
  price: number;
  currency: string;
}

export interface WorkingHoursDay {
  open: string;
  close: string;
  closed: boolean;
}

export type WorkingHours = Partial<
  Record<"sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat", WorkingHoursDay>
>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_type: BusinessType;
          description: string | null;
          services: ServiceItem[];
          phone: string | null;
          whatsapp: string | null;
          city: string | null;
          address: string | null;
          working_hours: WorkingHours;
          instagram: string | null;
          tiktok: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["businesses"]["Row"]> & {
          user_id: string;
          business_name: string;
          business_type: BusinessType;
        };
        Update: Partial<Database["public"]["Tables"]["businesses"]["Row"]>;
        Relationships: [];
      };
      business_images: {
        Row: {
          id: string;
          business_id: string;
          url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["business_images"]["Row"]> & {
          business_id: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_images"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "business_images_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
      templates: {
        Row: {
          id: string;
          slug: string;
          name: string;
          business_type: BusinessType;
          preview_image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["templates"]["Row"]> & {
          slug: string;
          name: string;
          business_type: BusinessType;
        };
        Update: Partial<Database["public"]["Tables"]["templates"]["Row"]>;
        Relationships: [];
      };
      websites: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          template_id: string;
          slug: string;
          colors: { primary: string; accent: string };
          font: string;
          sections_order: string[];
          content_overrides: Record<string, unknown>;
          status: WebsiteStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["websites"]["Row"]> & {
          business_id: string;
          user_id: string;
          template_id: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["websites"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "websites_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "websites_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      business_type: BusinessType;
      website_status: WebsiteStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
