import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChefHat, Sparkles, Users, Clock } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: ChefHat,
      title: 'KI-gestützte Rezepte',
      description: 'Lass dir von unserer KI personalisierte Rezepte basierend auf deinen Vorlieben erstellen.'
    },
    {
      icon: Clock,
      title: 'Schnell & Einfach',
      description: 'Finde Rezepte für jeden Zeitrahmen - von 15-Minuten-Gerichten bis zum Festtagsmenü.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Entdecke Rezepte von anderen Hobby- und Profiköchen und teile deine eigenen Kreationen.'
    },
    {
      icon: Sparkles,
      title: 'Intelligente Features',
      description: 'Portionen automatisch anpassen, Einkaufslisten generieren und Rezepte versionieren.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10">
      {/* Hero Section */}
      <div className="container-mobile">
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 py-12">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
              <span className="text-primary-foreground font-bold text-3xl">M</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              Mirolo
            </h1>
            <p className="text-xl text-muted-foreground">
              Deine intelligente Koch-App
            </p>
          </div>

          {/* Hero Text */}
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
              Entdecke, erstelle und teile deine Lieblingsrezepte
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Mit KI-Unterstützung, intelligenten Features und einer lebendigen Community 
              wird Kochen zu einem Erlebnis. Lass dich inspirieren und werde zum Meisterkoch.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto px-8 py-3 text-lg">
                Jetzt starten
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3 text-lg">
                Mehr erfahren
              </Button>
            </Link>
          </div>

          {/* Hero Image Placeholder */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl border border-border flex items-center justify-center">
              <div className="text-center">
                <ChefHat size={48} className="text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">App Screenshot kommt hier</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/50">
        <div className="container-mobile">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Warum Mirolo?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unsere innovativen Features machen das Kochen einfacher, 
              kreativer und sozialer als je zuvor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-mirolo text-center md:text-left">
                <feature.icon size={48} className="text-primary mx-auto md:mx-0 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-mobile text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Bereit für dein Kochabenteuer?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Werde Teil der Mirolo-Community und entdecke eine neue Art des Kochens. 
              Kostenlos starten - ohne Kreditkarte.
            </p>
            <Link href="/auth">
              <Button size="lg" className="px-8 py-3 text-lg">
                Kostenlos registrieren
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container-mobile text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-foreground">Mirolo</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 Mirolo. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  )
}