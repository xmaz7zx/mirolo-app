'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import RecipeDetail from '@/components/recipe/recipe-detail'
import { useRecipe } from '@/hooks/useRecipes'
import { useAuthContext } from '@/components/providers/auth-provider'
import { LoadingPage } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface RecipePageProps {
  params: Promise<{ id: string }>
}

export default function RecipePage(props: RecipePageProps) {
  const params = use(props.params)
  const { data: recipe, isLoading, error } = useRecipe(params.id)
  const { user } = useAuthContext()
  const router = useRouter()

  const canEdit = recipe?.user_id === user?.id

  const handleEdit = () => {
    router.push(`/rezept/${params.id}/bearbeiten`)
  }

  if (isLoading) {
    return <LoadingPage text="Rezept wird geladen..." />
  }

  if (error) {
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button>
                <ArrowLeft size={16} className="mr-2" />
                Zurück zur Übersicht
              </Button>
            </Link>
            <Link href="/suche">
              <Button variant="outline">
                Andere Rezepte suchen
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!recipe) {
    return (
      <MainLayout
        headerProps={{
          title: 'Nicht gefunden',
          showBack: true,
        }}
      >
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Rezept nicht verfügbar
          </h1>
          <p className="text-muted-foreground mb-6">
            Dieses Rezept ist möglicherweise privat oder wurde entfernt.
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

  return (
    <MainLayout
      headerProps={{
        title: recipe.title,
        showBack: true,
      }}
      noPadding
    >
      <div className="container-mobile py-4">
        <RecipeDetail
          recipe={recipe}
          canEdit={canEdit}
          onEdit={handleEdit}
        />
      </div>
    </MainLayout>
  )
}