export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          title: string
          summary: string | null
          cuisine: string | null
          difficulty: "easy" | "medium" | "hard" | null
          servings: number | null
          total_minutes: number | null
          active_minutes: number | null
          ingredients: Json
          steps: Json
          tips: Json | null
          nutrition: Json | null
          is_favorite: boolean | null
          is_public: boolean | null
          view_count: number | null
          like_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          summary?: string | null
          cuisine?: string | null
          difficulty?: "easy" | "medium" | "hard" | null
          servings?: number | null
          total_minutes?: number | null
          active_minutes?: number | null
          ingredients?: Json
          steps?: Json
          tips?: Json | null
          nutrition?: Json | null
          is_favorite?: boolean | null
          is_public?: boolean | null
          view_count?: number | null
          like_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          summary?: string | null
          cuisine?: string | null
          difficulty?: "easy" | "medium" | "hard" | null
          servings?: number | null
          total_minutes?: number | null
          active_minutes?: number | null
          ingredients?: Json
          steps?: Json
          tips?: Json | null
          nutrition?: Json | null
          is_favorite?: boolean | null
          is_public?: boolean | null
          view_count?: number | null
          like_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      recipe_versions: {
        Row: {
          id: string
          recipe_id: string
          version_number: number
          changes_notes: string | null
          recipe_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          version_number: number
          changes_notes?: string | null
          recipe_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          version_number?: number
          changes_notes?: string | null
          recipe_data?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_versions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          }
        ]
      }
      recipe_photos: {
        Row: {
          id: string
          recipe_id: string
          photo_url: string
          photo_type: "main" | "step" | "result" | null
          step_number: number | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          photo_url: string
          photo_type?: "main" | "step" | "result" | null
          step_number?: number | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          photo_url?: string
          photo_type?: "main" | "step" | "result" | null
          step_number?: number | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_photos_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          category: "cuisine" | "diet" | "method" | "occasion" | "ingredient" | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: "cuisine" | "diet" | "method" | "occasion" | "ingredient" | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: "cuisine" | "diet" | "method" | "occasion" | "ingredient" | null
          created_at?: string
        }
        Relationships: []
      }
      recipe_tags: {
        Row: {
          recipe_id: string
          tag_id: string
          added_at: string
        }
        Insert: {
          recipe_id: string
          tag_id: string
          added_at?: string
        }
        Update: {
          recipe_id?: string
          tag_id?: string
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      shopping_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          items: Json
          is_completed: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          items?: Json
          is_completed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          items?: Json
          is_completed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      recipe_likes: {
        Row: {
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_likes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}