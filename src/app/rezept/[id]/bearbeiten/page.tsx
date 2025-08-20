'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import RecipeForm from '@/components/recipe/recipe-form'
import { useRecipe } from '@/hooks/useRecipes'
import { useAuthContext } from '@/components/providers/auth-provider'
import { LoadingPage } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle, Lock } from 'lucide-react'
import Link from 'next/link'
import type { Recipe } from '@/types'

interface EditRecipePageProps {
  params: Promise<{ id: string }>
}

export default function EditRecipePage(props: EditRecipePageProps) {
  const params = use(props.params)
  const { data: recipe, isLoading, error } = useRecipe(params.id)
  const { user } = useAuthContext()
  const router = useRouter()

  const handleSave = (updatedRecipe: Recipe) => {
    router.push(`/rezept/${updatedRecipe.id}`)
  }

  if (isLoading) {
    return <LoadingPage text="Rezept wird geladen..." />
  }

  if (error || !recipe) {
    return (
      <MainLayout
        headerProps={{
          title: 'Fehler',
          showBack: true,
        }}
      >
        <div className="text-center py-12">
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Rezept nicht gefunden
          </h1>
          <p className="text-muted-foreground mb-6">
            Das Rezept konnte nicht geladen werden oder existiert nicht.
          </p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft size={16} className="mr-2" />
              Zurück zur Übersicht
            </Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  // Check if user can edit this recipe
  if (recipe.user_id !== user?.id) {
    return (
      <MainLayout
        headerProps={{
          title: 'Nicht berechtigt',
          showBack: true,
        }}
      >
        <div className="text-center py-12">
          <Lock size={48} className="text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Bearbeitung nicht erlaubt
          </h1>
          <p className="text-muted-foreground mb-6">
            Du kannst nur deine eigenen Rezepte bearbeiten.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/rezept/${params.id}`}>
              <Button>
                <ArrowLeft size={16} className="mr-2" />
                Rezept ansehen
              </Button>
            </Link>
            <Link href="/rezept/neu">
              <Button variant="outline">
                Eigenes Rezept erstellen
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout
      headerProps={{
        title: 'Rezept bearbeiten',
        showBack: true,
      }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          „{recipe.title}" bearbeiten
        </h1>
        <p className="text-muted-foreground">
          Nimm Änderungen an deinem Rezept vor. Eine neue Version wird automatisch erstellt.
        </p>
      </div>

      <RecipeForm
        initialRecipe={recipe}
        onSave={handleSave}
      />
    </MainLayout>
  )
}