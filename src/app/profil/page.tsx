'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/main-layout'
import { useAuthContext } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { Settings, LogOut, User, Mail, Calendar, ChefHat, Heart, Clock, Edit2, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, updateProfile, signOut } = useAuthContext()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.profile?.display_name || '')
  const [bio, setBio] = useState(user?.profile?.bio || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      await updateProfile({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      })
      setIsEditing(false)
    } catch (error: any) {
      setError(error.message || 'Fehler beim Speichern')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setDisplayName(user?.profile?.display_name || '')
    setBio(user?.profile?.bio || '')
    setIsEditing(false)
    setError('')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  const memberSince = new Date(user.created_at).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <MainLayout
      headerProps={{
        title: 'Profil',
        action: (
          <Link href="/profil/einstellungen">
            <Button variant="ghost" size="sm" className="p-2">
              <Settings size={20} />
            </Button>
          </Link>
        )
      }}
    >
      {/* Profile Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
            {user.profile?.avatar_url ? (
              <img
                src={user.profile.avatar_url}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.profile?.display_name?.[0]?.toUpperCase() || 
              user.email?.[0]?.toUpperCase()
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-card border-2 border-background rounded-full flex items-center justify-center shadow-sm hover:bg-accent transition-colors">
            <Edit2 size={14} className="text-muted-foreground" />
          </button>
        </div>

        {!isEditing ? (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {user.profile?.display_name || 'Mirolo Benutzer'}
            </h1>
            <p className="text-muted-foreground mb-3">
              {user.profile?.bio || 'Leidenschaftlicher Hobbykoch'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 size={14} className="mr-2" />
              Bearbeiten
            </Button>
          </>
        ) : (
          <div className="space-y-4 max-w-sm mx-auto">
            <Input
              placeholder="Dein Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              placeholder="Bio (optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={loading}
                className="flex-1"
              >
                {loading ? <LoadingSpinner className="mr-2" /> : <Check size={14} className="mr-2" />}
                Speichern
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
              >
                <X size={14} className="mr-2" />
                Abbrechen
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-card rounded-lg border">
          <div className="text-2xl font-bold text-primary mb-1">12</div>
          <div className="text-sm text-muted-foreground">Rezepte</div>
        </div>
        <div className="text-center p-4 bg-card rounded-lg border">
          <div className="text-2xl font-bold text-primary mb-1">8</div>
          <div className="text-sm text-muted-foreground">Favoriten</div>
        </div>
        <div className="text-center p-4 bg-card rounded-lg border">
          <div className="text-2xl font-bold text-primary mb-1">156</div>
          <div className="text-sm text-muted-foreground">Likes</div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="space-y-4 mb-8">
        <div className="card-mirolo">
          <h2 className="font-semibold text-foreground mb-4">Account-Informationen</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2">
              <Mail size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">E-Mail</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <Calendar size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Mitglied seit</p>
                <p className="text-sm text-muted-foreground">{memberSince}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3 mb-8">
        <Link href="/dashboard" className="block">
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border hover:bg-accent transition-colors">
            <ChefHat size={20} className="text-primary" />
            <div>
              <p className="font-medium text-foreground">Meine Rezepte</p>
              <p className="text-sm text-muted-foreground">Alle deine gespeicherten Rezepte</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard?tab=favorites" className="block">
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border hover:bg-accent transition-colors">
            <Heart size={20} className="text-primary" />
            <div>
              <p className="font-medium text-foreground">Favoriten</p>
              <p className="text-sm text-muted-foreground">Deine als Favorit markierten Rezepte</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard?tab=recent" className="block">
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border hover:bg-accent transition-colors">
            <Clock size={20} className="text-primary" />
            <div>
              <p className="font-medium text-foreground">Kürzlich verwendet</p>
              <p className="text-sm text-muted-foreground">Letzte Rezepte und Aktivitäten</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Settings & Sign Out */}
      <div className="space-y-3">
        <Link href="/profil/einstellungen" className="block">
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border hover:bg-accent transition-colors">
            <Settings size={20} className="text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Einstellungen</p>
              <p className="text-sm text-muted-foreground">App-Einstellungen und Präferenzen</p>
            </div>
          </div>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-4 bg-card rounded-lg border hover:bg-destructive/10 transition-colors text-left"
        >
          <LogOut size={20} className="text-destructive" />
          <div>
            <p className="font-medium text-destructive">Abmelden</p>
            <p className="text-sm text-muted-foreground">Von deinem Account abmelden</p>
          </div>
        </button>
      </div>
    </MainLayout>
  )
}