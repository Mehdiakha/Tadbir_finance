"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { DashboardCharts } from "@/components/dashboard-charts"
import { SavingsGoals } from "@/components/savings-goals"
import { AIChat } from "@/components/ai-chat"
import { AppSidebar } from "@/components/app-sidebar"
import { PremiumSection } from "@/components/premium-section"
import { DollarSign, TrendingUp, Target, PieChart, Crown, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface Expense {
  id: string
  amount: number
  category: string
  date: string
  notes?: string
}

interface AIUsage {
  isPremium: boolean
  used: number
  limit: number
  remaining: number
  canSendMessage: boolean
}

// Custom hook for intersection observer
function useInView<T extends HTMLElement = HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new window.IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView] as const
}

export default function Home() {
  const { data: session, status } = useSession()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [aiUsage, setAiUsage] = useState<AIUsage | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'fr'>('en')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    setShowLoading(true)
    const timer = setTimeout(() => setShowLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Texts for EN/FR
  const t = {
    en: {
      navFeatures: 'Features',
      navPricing: 'Pricing',
      navAbout: 'About',
      signIn: 'Sign In',
      getStarted: 'Get Started',
      heroTitle: 'Beyond Budgeting: A Financial Brain',
      heroSubtitle: '',
      heroDesc: 'Automatically track your expenses, set budgets, and achieve your financial goals with AI-powered insights.',
      createAccount: 'Create Account',
      watchDemo: 'Watch Demo',
      downloads: '10k+ Downloads',
      trusted: 'Trusted by users worldwide',
      pricingTitle: 'Pricing Plans',
      free: 'Free',
      premium: 'Premium',
      enterprise: 'Enterprise',
      mostPopular: 'Most Popular',
      getStartedBtn: 'Get Started',
      upgrade: 'Upgrade',
      contactSales: 'Contact Sales',
      contactUs: 'Contact Us',
      yourName: 'Your Name',
      yourEmail: 'Your Email',
      yourMessage: 'Your Message',
      sendMessage: 'Send Message',
      downloadApp: 'Download the app',
      ios: 'iOS',
      android: 'Android',
    },
    fr: {
      navFeatures: 'Fonctionnalités',
      navPricing: 'Tarifs',
      navAbout: 'À propos',
      signIn: 'Connexion',
      getStarted: 'Commencer',
      heroTitle: 'Au-delà du budget, un cerveau financier',
      heroSubtitle: '',
      heroDesc: 'Suivez automatiquement vos dépenses, définissez des budgets et atteignez vos objectifs financiers grâce à l’IA.',
      createAccount: 'Créer un compte',
      watchDemo: 'Voir la démo',
      downloads: '10k+ Téléchargements',
      trusted: 'Approuvé par des utilisateurs du monde entier',
      pricingTitle: 'Nos offres',
      free: 'Gratuit',
      premium: 'Premium',
      enterprise: 'Entreprise',
      mostPopular: 'Le plus populaire',
      getStartedBtn: 'Commencer',
      upgrade: 'Passer Premium',
      contactSales: 'Contactez-nous',
      contactUs: 'Contactez-nous',
      yourName: 'Votre nom',
      yourEmail: 'Votre email',
      yourMessage: 'Votre message',
      sendMessage: 'Envoyer',
      downloadApp: 'Télécharger l’application',
      ios: 'iOS',
      android: 'Android',
    }
  }[language]

  useEffect(() => {
    if (session) {
      fetchExpenses()
      fetchAIUsage()
    }

    // Check for success message from signup
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get("message")
    if (message) {
      console.log("Success message:", message)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [session])

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses")
      const data = await response.json()
      setExpenses(data)
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAIUsage = async () => {
    try {
      const response = await fetch("/api/ai-usage")
      const data = await response.json()
      setAiUsage(data)
    } catch (error) {
      console.error("Error fetching AI usage:", error)
    }
  }

  const handleAddExpense = async (expenseData: any) => {
    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      })
      fetchExpenses()
    } catch (error) {
      console.error("Error adding expense:", error)
    }
  }

  const handleUpgrade = () => {
    alert("Premium upgrade coming soon! This will integrate with Stripe for payments.")
  }

  if (showLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef]">
        <span className="font-extrabold text-4xl tracking-tight unbounded-logo mb-6" style={{ letterSpacing: '-0.02em', fontWeight: 700, color: '#222' }}>
          <span style={{ color: '#10b981' }}>S</span>martBudget
        </span>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-progress-bar" style={{ width: '100%' }}></div>
        </div>
        <style>{`
          @keyframes progressBar {
            0% { width: 0; }
            100% { width: 100%; }
          }
          .animate-progress-bar {
            animation: progressBar 2s cubic-bezier(0.4,0,0.2,1) forwards;
          }
        `}</style>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00c6fb] relative overflow-hidden">
        {/* Noise overlay */}
        <div className="pointer-events-none fixed inset-0 z-0 opacity-30 mix-blend-soft-light" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/noise.png")', backgroundRepeat: 'repeat' }} />
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-4 md:p-8 max-w-7xl mx-auto">
          <span className="font-extrabold text-3xl tracking-tight unbounded-logo" style={{ letterSpacing: '-0.02em', fontWeight: 700, color: '#fff' }}><span style={{ color: '#10b981' }}>S</span>martBudget</span>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">{t.navFeatures}</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">{t.navPricing}</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">{t.navAbout}</a>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')} className="text-gray-300 hover:text-white px-3 py-1 rounded transition-colors border border-gray-600 bg-slate-800/60 text-sm font-semibold hidden md:inline-block">{language === 'en' ? 'FR' : 'EN'}</button>
            <Button
              variant="ghost"
              onClick={() => router.push("/auth/signin")}
              className="text-gray-300 hover:text-white hover:bg-white/10 hidden md:inline-block"
            >
              {t.signIn}
            </Button>
            <Button
              onClick={() => router.push("/auth/signup")}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 px-6 hidden md:inline-block"
            >
              {t.getStarted}
            </Button>
            {/* Hamburger menu for mobile */}
            <button className="md:hidden p-2 rounded hover:bg-white/10 transition" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-7 w-7 text-white" />
            </button>
          </div>
          {/* Mobile menu drawer */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="bg-slate-900/95 p-0 w-64">
              <div className="flex flex-col gap-6 p-6">
                <span className="font-extrabold text-3xl tracking-tight text-white mb-4 unbounded-logo" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}><span style={{ color: '#10b981' }}>S</span>martBudget</span>
                <a href="#features" className="text-gray-200 hover:text-emerald-400 text-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>{t.navFeatures}</a>
                <a href="#pricing" className="text-gray-200 hover:text-emerald-400 text-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>{t.navPricing}</a>
                <a href="#about" className="text-gray-200 hover:text-emerald-400 text-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>{t.navAbout}</a>
                <button onClick={() => { setLanguage(language === 'en' ? 'fr' : 'en'); setMobileMenuOpen(false) }} className="text-gray-200 hover:text-emerald-400 text-lg transition-colors text-left">{language === 'en' ? 'FR' : 'EN'}</button>
                <Button
                  variant="ghost"
                  onClick={() => { router.push("/auth/signin"); setMobileMenuOpen(false) }}
                  className="text-gray-200 hover:text-white hover:bg-white/10 w-full justify-start"
                >
                  {t.signIn}
                </Button>
                <Button
                  onClick={() => { router.push("/auth/signup"); setMobileMenuOpen(false) }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 w-full justify-start"
                >
                  {t.getStarted}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-20 flex flex-col items-center">
          <div className="w-full flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 poppins-regular">
              {t.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl mx-auto mb-8 poppins-extralight">
              {t.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button
                onClick={() => router.push("/auth/signup")}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 px-8 py-4 text-lg rounded-full shadow-md transition-all duration-300"
              >
                {t.createAccount}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white px-8 py-4 text-lg bg-transparent rounded-full transition-all duration-300"
              >
                {t.watchDemo}
                <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5v10l8-5-8-5z" />
                </svg>
              </Button>
            </div>
            <div className="flex items-center space-x-6 pt-6 justify-center">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-slate-800"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-red-400 border-2 border-slate-800"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 border-2 border-slate-800"></div>
              </div>
              <div className="text-white">
                <div className="text-2xl font-bold">{t.downloads}</div>
                <div className="text-gray-400 text-sm">{t.trusted}</div>
              </div>
            </div>
          </div>
          {/* Right Content - Mockup */}
          <div className="relative hidden lg:block mt-10">
            {/* Make phone mockup bigger and smoother */}
            <div className="relative z-10">
              {/* Laptop mockup */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-lg overflow-hidden">
                  {/* Browser bar */}
                  <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500">
                      smartbudget.app/dashboard
                    </div>
                  </div>
                  {/* Dashboard content */}
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Dashboard</h3>
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-emerald-500 rounded-full"></div>
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-2xl font-bold text-emerald-600">$23,643.00</div>
                          <div className="text-sm text-gray-500">Total Balance</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-2xl font-bold text-blue-600">4.93%</div>
                          <div className="text-sm text-gray-500">Growth</div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-sm font-medium text-gray-700 mb-2">Recent Transactions</div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-red-100 rounded-full"></div>
                              <span className="text-sm">Grocery Store</span>
                            </div>
                            <span className="text-sm font-medium">-$85.20</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full"></div>
                              <span className="text-sm">Salary Deposit</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">+$3,200.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Mobile mockup - revert to previous size/animation */}
              <div className="absolute -bottom-8 -right-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-2 shadow-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                <div className="w-48 h-96 bg-white rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
                    <div className="text-center">
                      <div className="text-2xl font-bold">$23,643</div>
                      <div className="text-sm opacity-90">Available Balance</div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">This Month</div>
                      <div className="text-lg font-semibold">$2,847.30</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700">Quick Actions</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50 p-2 rounded text-center">
                          <div className="text-xs text-emerald-600">Add Expense</div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <div className="text-xs text-blue-600">View Reports</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute top-10 -left-10 w-20 h-20 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 -right-5 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
            {/* Download App Section */}
            <div className="mt-14 flex flex-col items-center">
              <div className="text-base font-semibold text-white mb-3">{t.downloadApp}</div>
              <div className="flex gap-4">
                <a href="#" className="flex items-center gap-2 bg-black/80 hover:bg-black/90 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M17.564 13.271c-.025-2.568 2.099-3.797 2.192-3.854-1.197-1.748-3.06-1.99-3.719-2.018-1.584-.161-3.09.927-3.892.927-.803 0-2.033-.904-3.346-.88-1.72.025-3.312 1.002-4.194 2.547-1.797 3.116-.459 7.719 1.29 10.246.857 1.23 1.872 2.61 3.207 2.56 1.293-.052 1.78-.828 3.34-.828 1.56 0 1.995.828 3.35.803 1.388-.025 2.256-1.25 3.108-2.482.98-1.426 1.385-2.81 1.408-2.88-.03-.014-2.7-1.037-2.726-4.024zm-3.23-7.36c.71-.86 1.19-2.06 1.06-3.271-1.02.041-2.25.68-2.98 1.54-.654.755-1.23 1.963-1.014 3.12 1.13.088 2.29-.574 3.01-1.389z"/></svg>
                  <span className="font-semibold">{t.ios}</span>
                </a>
                <a href="#" className="flex items-center gap-2 bg-black/80 hover:bg-black/90 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 2.3c-.4-.5-1-.8-1.6-.8-.6 0-1.2.3-1.6.8l-9.2 13.2c-.4.5-.4 1.2-.1 1.7.3.5.9.8 1.5.8h18.4c.6 0 1.2-.3 1.5-.8.3-.5.3-1.2-.1-1.7l-9.2-13.2zm-1.6 1.7l9.2 13.2h-18.4l9.2-13.2zm-1.6 15.3c-.6 0-1.2.3-1.5.8-.3.5-.3 1.2.1 1.7l2.3 3.3c.4.5 1 .8 1.6.8.6 0 1.2-.3 1.6-.8l2.3-3.3c.4-.5.4-1.2.1-1.7-.3-.5-.9-.8-1.5-.8h-4.6z"/></svg>
                  <span className="font-semibold">{t.android}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 pb-32 mt-28">
          <h2 className="text-4xl font-bold text-center text-white mb-16 tracking-tight">{t.pricingTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
            {/* Free Plan */}
            <div className="bg-white/95 rounded-2xl shadow-lg p-10 flex flex-col items-center border border-gray-300 min-h-[440px] transition-all duration-300 hover:shadow-2xl">
              <h3 className="text-2xl font-bold mb-2 text-emerald-700">{t.free}</h3>
              <div className="text-4xl font-extrabold text-emerald-500 mb-4">0 MAD</div>
              <ul className="text-gray-700 mb-10 space-y-3 text-left w-full max-w-xs mx-auto text-base">
                <li>✔️ {language === 'fr' ? 'Suivi illimité des dépenses' : 'Track unlimited expenses'}</li>
                <li>✔️ {language === 'fr' ? 'Budgets mensuels' : 'Set monthly budgets'}</li>
                <li>✔️ {language === 'fr' ? 'Tableau de bord analytique basique' : 'Basic analytics dashboard'}</li>
                <li>✔️ {language === 'fr' ? 'Jusqu’à 3 objectifs d’épargne' : 'Up to 3 savings goals'}</li>
                <li>✔️ {language === 'fr' ? 'Support par email' : 'Email support'}</li>
                <li>✔️ {language === 'fr' ? 'Exportation des données (CSV)' : 'Export data (CSV)'}</li>
              </ul>
              <Button onClick={() => router.push("/auth/signup")} className="w-full bg-emerald-500 text-white font-semibold rounded-full">{t.getStartedBtn}</Button>
            </div>
            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl shadow-2xl p-12 flex flex-col items-center border-4 border-yellow-300 min-h-[480px] relative scale-105 z-10 transition-all duration-300 hover:shadow-emerald-400/30">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-300 text-yellow-900 px-4 py-1 rounded-full font-semibold text-xs">{t.mostPopular}</span>
              <h3 className="text-2xl font-bold text-white mb-2">{t.premium}</h3>
              <div className="flex flex-col items-center mb-4">
                {language === 'fr' ? (
                  <>
                    <span className="text-4xl font-extrabold text-white">29 MAD<span className="text-lg font-medium">/mois</span></span>
                    <span className="text-xl font-semibold text-white mt-1">ou 300 MAD/an</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold text-white">29 MAD<span className="text-lg font-medium">/month</span></span>
                    <span className="text-xl font-semibold text-white mt-1">or 300 MAD/year</span>
                  </>
                )}
              </div>
              <ul className="text-white mb-10 space-y-3 text-left w-full max-w-xs mx-auto text-base">
                <li>✔️ {language === 'fr' ? 'Tout dans Gratuit' : 'Everything in Free'}</li>
                <li>✔️ {language === 'fr' ? 'Objectifs d’épargne illimités' : 'Unlimited savings goals'}</li>
                <li>✔️ {language === 'fr' ? 'Analyses avancées & rapports personnalisés' : 'Advanced analytics & custom reports'}</li>
                <li>✔️ {language === 'fr' ? 'Insights financiers IA' : 'AI-powered financial insights'}</li>
                <li>✔️ {language === 'fr' ? 'Scan intelligent des reçus' : 'Smart receipt scanning'}</li>
                <li>✔️ {language === 'fr' ? 'Synchronisation multi-appareils' : 'Multi-device sync'}</li>
                <li>✔️ {language === 'fr' ? 'Support prioritaire email & chat' : 'Priority email & chat support'}</li>
                <li>✔️ {language === 'fr' ? 'Accès anticipé aux nouveautés' : 'Early access to new features'}</li>
              </ul>
              <Button onClick={() => router.push("/auth/signup")} className="w-full bg-yellow-300 text-yellow-900 font-bold hover:bg-yellow-400 rounded-full">{t.upgrade}</Button>
            </div>
            {/* Enterprise Plan */}
            <div className="bg-white/95 rounded-2xl shadow-lg p-12 flex flex-col items-center border-2 border-emerald-500 min-h-[480px] transition-all duration-300 hover:shadow-2xl">
              <h3 className="text-2xl font-bold mb-2 text-emerald-800">{t.enterprise}</h3>
              <div className="text-4xl font-extrabold text-emerald-500 mb-4">990 MAD<span className="text-lg font-medium">/mo</span></div>
              <ul className="text-gray-800 mb-10 space-y-3 text-left w-full max-w-xs mx-auto text-base">
                <li>✔️ {language === 'fr' ? 'Tout dans Premium' : 'Everything in Premium'}</li>
                <li>✔️ {language === 'fr' ? 'Gestion d’équipe & des rôles' : 'Team & role management'}</li>
                <li>✔️ {language === 'fr' ? 'Gestionnaire de compte dédié' : 'Dedicated account manager'}</li>
                <li>✔️ {language === 'fr' ? 'Intégrations personnalisées (API, SSO, etc.)' : 'Custom integrations (API, SSO, etc.)'}</li>
                <li>✔️ {language === 'fr' ? 'SLA & accompagnement onboarding' : 'SLA & onboarding assistance'}</li>
                <li>✔️ {language === 'fr' ? 'Sécurité & conformité avancées' : 'Advanced security & compliance'}</li>
                <li>✔️ {language === 'fr' ? 'Rapports & exports personnalisés' : 'Custom reporting & exports'}</li>
                <li>✔️ {language === 'fr' ? 'Support téléphonique prioritaire' : 'Priority phone support'}</li>
                <li>✔️ {language === 'fr' ? 'Revue business trimestrielle' : 'Quarterly business reviews'}</li>
              </ul>
              <Button variant="outline" onClick={() => router.push("/auth/signup")} className="w-full border-emerald-500 text-emerald-700 font-semibold rounded-full">{t.contactSales}</Button>
            </div>
          </div>
        </section>
        {/* Contact Form Section */}
        <section id="contact" className="relative z-10 max-w-2xl mx-auto px-6 pb-32 mt-24">
          <h2 className="text-3xl font-bold text-center text-white mb-6">{t.contactUs}</h2>
          <div className="text-center text-lg text-white bg-white/10 rounded-xl p-8 shadow-md border border-emerald-200">
            Contact us at <a href="mailto:smartbudgetbusiness@gmail.com" className="text-emerald-400 underline hover:text-emerald-300 transition-colors">smartbudgetbusiness@gmail.com</a>
          </div>
        </section>

        {/* Footer with company logos */}
        <footer className="relative z-10 w-full bg-slate-900/80 py-8 mt-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-gray-400 text-sm text-center md:text-left mb-2 md:mb-0">&copy; {new Date().getFullYear()} SmartBudget. All rights reserved.</div>
            <div className="flex justify-center items-center space-x-8 opacity-50">
              <span className="text-gray-400 font-semibold">Trusted by teams at</span>
              <span className="text-gray-400 font-semibold">Spotify</span>
              <span className="text-gray-400 font-semibold">Airbnb</span>
              <span className="text-gray-400 font-semibold">Slack</span>
              <span className="text-gray-400 font-semibold">Stripe</span>
              <span className="text-gray-400 font-semibold">Booking.com</span>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const thisMonthExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date)
      const now = new Date()
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  const categoryBreakdown = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategory = Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]

  return (
    <SidebarProvider>
      <AppSidebar aiUsage={aiUsage} activeTab={activeTab} onTabChange={setActiveTab} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">{session?.user?.name ? `${session.user.name}'s Dashboard` : 'Dashboard'}</h1>
            <div className="flex items-center gap-4">
              {aiUsage?.isPremium && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              {aiUsage && !aiUsage.isPremium && (
                <Badge variant="outline" className="text-xs">
                  AI: {aiUsage.used}/{aiUsage.limit}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground hidden sm:block">{session.user?.name}</span>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-4 p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="goals">Savings Goals</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Premium Section */}
              <PremiumSection aiUsage={aiUsage} onUpgrade={handleUpgrade} />

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${thisMonthExpenses.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{topCategory ? topCategory[0] : "None"}</div>
                    {topCategory && <p className="text-xs text-muted-foreground">${topCategory[1].toFixed(2)}</p>}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{expenses.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ExpenseForm onSubmit={handleAddExpense} />
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {expenses.slice(0, 5).map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">${expense.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{expense.category}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                    {expenses.length === 0 && <p className="text-center text-muted-foreground py-4">No expenses yet</p>}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <ExpenseForm onSubmit={handleAddExpense} />
                <div className="lg:col-span-2">
                  <ExpenseList expenses={expenses} onUpdate={fetchExpenses} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="goals">
              <SavingsGoals />
            </TabsContent>

            <TabsContent value="analytics">
              <DashboardCharts expenses={expenses} />
            </TabsContent>
          </Tabs>
        </main>

        <AIChat />
      </SidebarInset>
    </SidebarProvider>
  )
}
