'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/main-layout'
import { useAuthContext } from '@/components/providers/auth-provider'
import { useUserRecipes } from '@/hooks/useRecipes'
import { LoadingCard } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Plus, Search, RefreshCw, Clock, Users, ChefHat } from 'lucide-react'
import Link from 'next/link'
import { useTabSwipeNavigation, usePullToRefresh } from '@/hooks/useSwipeGestures'
import { useQueryClient } from '@tanstack/react-query'
import { recipeKeys } from '@/hooks/useRecipes'

type TabType = 'mine' | 'favorites' | 'recent'

const tabs = [
  { key: 'mine' as TabType, label: 'Meine Rezepte', count: 0 },
  { key: 'favorites' as TabType, label: 'Favoriten', count: 0 },
  { key: 'recent' as TabType, label: 'Kürzlich', count: 0 },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('mine')
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  
  const { data: recipes, isLoading, error, refetch } = useUserRecipes({ 
    tab: activeTab 
  })

  // Tab swipe navigation
  const tabSwipe = useTabSwipeNavigation({
    tabs: tabs.map(t => t.key),
    currentTab: activeTab,
    onTabChange: (tab) => setActiveTab(tab as TabType)
  })

  // Pull to refresh
  const pullToRefresh = usePullToRefresh(async () => {
    await refetch()
    queryClient.invalidateQueries({ queryKey: recipeKeys.all })
  })

  const recipeCounts = {
    mine: recipes?.filter(r => r.user_id === user?.id).length || 0,
    favorites: recipes?.filter(r => r.is_favorite).length || 0,
    recent: Math.min(recipes?.length || 0, 20),
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Guten Morgen'
    if (hour < 18) return 'Guten Tag'
    return 'Guten Abend'
  }

  const userName = user?.profile?.display_name || user?.email?.split('@')[0] || 'Koch'

  return (
    <MainLayout
      headerProps={{
        title: 'Meine Rezepte',
        showNotifications: true,
        action: (
          <Link href="/suche">
            <Button variant="ghost" size="sm" className="p-2">
              <Search size={20} />
            </Button>
          </Link>
        )
      }}
    >
      {/* Pull to refresh indicator */}
      {pullToRefresh.isPulling && (
        <div 
          className="fixed top-16 left-0 right-0 z-40 flex justify-center"
          style={{
            transform: `translateY(${Math.min(pullToRefresh.pullDistance, 60)}px)`,
            opacity: pullToRefresh.pullProgress
          }}
        >
          <div className="bg-card border border-border rounded-full p-2 shadow-lg">
            <RefreshCw 
              size={16} 
              className={`text-primary ${pullToRefresh.isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: `rotate(${pullToRefresh.pullProgress * 180}deg)`
              }}
            />
          </div>
        </div>
      )}

      <div 
        className="touch-pan-y"
        {...pullToRefresh.listeners}
        {...tabSwipe.listeners}
      >
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Was möchtest du heute kochen?
        </p>
      </div>

      {/* Quick Actions - Optimiert für Touch */}
      <div className="space-y-4 mb-6">
        <Link href="/rezept/neu">
          <Button className="w-full h-16 text-lg touch-manipulation">
            <Plus size={24} className="mr-3" />
            <span>Neues Rezept erstellen</span>
          </Button>
        </Link>
        
        <Link href="/rezept/neu?ai=true">
          <Button variant="outline" className="w-full h-16 text-lg touch-manipulation">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center mr-3">
              <span className="text-primary-foreground text-sm font-bold">⚡</span>
            </div>
            <span>Schnell mit KI erstellen</span>
          </Button>
        </Link>
      </div>

      {/* Recipe Stats - Mobile optimiert */}
      {!isLoading && recipes && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {recipeCounts.mine}
              </div>
              <div className="text-sm text-muted-foreground">Rezepte</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {recipeCounts.favorites}
              </div>
              <div className="text-sm text-muted-foreground">Favoriten</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {Math.floor((recipeCounts.mine || 1) * 2.3)}
              </div>
              <div className="text-sm text-muted-foreground">Portionen</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs - Touch-optimiert */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-4 px-4 rounded-md text-sm font-medium transition-colors touch-manipulation ${
              activeTab === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="text-center">
              <div>{tab.label}</div>
              {recipeCounts[tab.key] > 0 && (
                <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full mt-1 inline-block">
                  {recipeCounts[tab.key]}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Recipes List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              Fehler beim Laden der Rezepte
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Erneut versuchen
            </Button>
          </div>
        ) : !recipes || recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {activeTab === 'mine' ? 'Noch keine Rezepte' :
               activeTab === 'favorites' ? 'Noch keine Favoriten' :
               'Noch keine kürzlichen Rezepte'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {activeTab === 'mine' 
                ? 'Erstelle dein erstes Rezept oder lass es dir von unserer KI generieren.'
                : activeTab === 'favorites'
                ? 'Markiere Rezepte als Favoriten, um sie hier zu sehen.'
                : 'Bearbeitete Rezepte erscheinen hier.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/rezept/neu">
                <Button>
                  <Plus size={16} className="mr-2" />
                  Erstes Rezept erstellen
                </Button>
              </Link>
              <Link href="/entdecken">
                <Button variant="outline">
                  Rezepte entdecken
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <Link key={recipe.id} href={`/rezept/${recipe.id}`}>
                <div className="recipe-card bg-card border border-border rounded-xl overflow-hidden touch-manipulation">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                    <span className="text-5xl">🍳</span>
                    {recipe.is_favorite && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white">♥</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1">
                      {recipe.title}
                    </h3>
                    {recipe.summary && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {recipe.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {recipe.total_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{recipe.total_minutes} Min</span>
                        </div>
                      )}
                      {recipe.servings && (
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{recipe.servings}</span>
                        </div>
                      )}
                      {recipe.difficulty && (
                        <div className="flex items-center gap-1">
                          <ChefHat size={14} />
                          <span className="capitalize">{recipe.difficulty}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      </div>
    </MainLayout>
  )
}