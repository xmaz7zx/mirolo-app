'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/main-layout'
import DiscoveryHeader from '@/components/discovery/discovery-header'
import DiscoveryCategories from '@/components/discovery/discovery-categories'
import FeaturedRecipes from '@/components/discovery/featured-recipes'
import TrendingRecipes from '@/components/discovery/trending-recipes'
import { usePublicRecipes, useFeaturedRecipes, useTrendingRecipes } from '@/hooks/useRecipes'

export default function DiscoveryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { 
    data: featuredRecipes,
    isLoading: featuredLoading 
  } = useFeaturedRecipes()

  const { 
    data: trendingRecipes,
    isLoading: trendingLoading 
  } = useTrendingRecipes()

  const { 
    data: categoryRecipes,
    isLoading: categoryLoading 
  } = usePublicRecipes({
    category: selectedCategory,
    enabled: !!selectedCategory
  })

  return (
    <MainLayout
      headerProps={{
        title: 'Entdecken',
        showBack: true,
      }}
      noPadding
    >
      <div className="container-mobile">
        {/* Header */}
        <div className="py-6">
          <DiscoveryHeader />
        </div>

        {/* Categories */}
        <div className="mb-8">
          <DiscoveryCategories
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {/* Category Results */}
        {selectedCategory ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4 capitalize">
              {selectedCategory} Rezepte
            </h2>
            
            {categoryLoading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-muted rounded-xl mb-4" />
                    <div className="space-y-2">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6">
                {categoryRecipes?.map((recipe) => (
                  <div key={recipe.id} className="recipe-card">
                    {/* Recipe content */}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Featured Recipes */}
            <div className="mb-8">
              <FeaturedRecipes 
                recipes={featuredRecipes || []}
                isLoading={featuredLoading}
              />
            </div>

            {/* Trending Recipes */}
            <div className="mb-8">
              <TrendingRecipes 
                recipes={trendingRecipes || []}
                isLoading={trendingLoading}
              />
            </div>

            {/* Community Highlights */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Community Highlights
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="card-mirolo text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👨‍🍳</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Koch des Monats
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Entdecke die beliebtesten Köche unserer Community
                  </p>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium">
                    Mehr erfahren →
                  </button>
                </div>

                <div className="card-mirolo text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Rezept-Challenge
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Nimm an unseren wöchentlichen Challenges teil
                  </p>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium">
                    Mitmachen →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}