'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Save, Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { HomepageContent } from '@/lib/homepage-content'
import { defaultHomepageContent } from '@/lib/homepage-content'
import type { Product } from '@/lib/storefront'
import { Checkbox } from '@/components/ui/checkbox'

type Tab = 'hero' | 'stats' | 'gamingPC' | 'performance' | 'whyChoose' | 'benefits' | 'testimonials' | 'products'

export default function HomeContentEditor() {
  const [activeTab, setActiveTab] = useState<Tab>('hero')
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  useEffect(() => {
    fetchContent()
    fetchProducts()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/homepage-content')
      const result = await response.json()
      if (result.success) {
        const mergedContent: HomepageContent = {
          ...defaultHomepageContent,
          ...result.data,
          hero: { ...defaultHomepageContent.hero, ...(result.data.hero || {}) },
          stats: result.data.stats || defaultHomepageContent.stats,
          whyChoose: { ...defaultHomepageContent.whyChoose, ...(result.data.whyChoose || {}) },
          benefits: { ...defaultHomepageContent.benefits, ...(result.data.benefits || {}) },
          testimonials: { ...defaultHomepageContent.testimonials, ...(result.data.testimonials || {}) },
          products: { ...defaultHomepageContent.products, ...(result.data.products || {}) },
          gamingPC: { ...defaultHomepageContent.gamingPC, ...(result.data.gamingPC || {}) },
          performance: { ...defaultHomepageContent.performance, ...(result.data.performance || {}) },
        }
        setContent(mergedContent)
      }
    } catch (error) {
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await fetch('/api/admin/products')
      const result = await response.json()
      if (result.success) {
        setProducts(result.data || [])
      }
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoadingProducts(false)
    }
  }

  const saveContent = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/homepage-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success('All changes saved successfully!')
      } else {
        throw new Error(result.error || 'Failed to save')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const updateHero = (field: keyof HomepageContent['hero'], value: string) => {
    setContent((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }))
  }

  const addStat = () => {
    setContent((prev) => ({
      ...prev,
      stats: [...prev.stats, { value: '', suffix: '', label: '' }],
    }))
  }

  const updateStat = (index: number, field: 'value' | 'suffix' | 'label', value: string) => {
    setContent((prev) => {
      const newStats = [...prev.stats]
      newStats[index] = { ...newStats[index], [field]: value }
      return { ...prev, stats: newStats }
    })
  }

  const deleteStat = (index: number) => {
    setContent((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }))
  }

  const updateWhyChoose = (field: 'sectionTitle' | 'subtitle', value: string) => {
    setContent((prev) => ({
      ...prev,
      whyChoose: { ...prev.whyChoose, [field]: value },
    }))
  }

  const addFeature = () => {
    setContent((prev) => ({
      ...prev,
      whyChoose: {
        ...prev.whyChoose,
        features: [
          ...prev.whyChoose.features,
          { title: '', description: '', featureItems: [] },
        ],
      },
    }))
  }

  const updateFeature = (
    index: number,
    field: 'title' | 'description' | 'featureItems',
    value: string | string[]
  ) => {
    setContent((prev) => {
      const newFeatures = [...prev.whyChoose.features]
      newFeatures[index] = { ...newFeatures[index], [field]: value }
      return { ...prev, whyChoose: { ...prev.whyChoose, features: newFeatures } }
    })
  }

  const deleteFeature = (index: number) => {
    setContent((prev) => ({
      ...prev,
      whyChoose: {
        ...prev.whyChoose,
        features: prev.whyChoose.features.filter((_, i) => i !== index),
      },
    }))
  }

  const updateProducts = (field: 'sectionTitle' | 'subtitle', value: string) => {
    setContent((prev) => ({
      ...prev,
      products: { ...prev.products, [field]: value },
    }))
  }

  const toggleFeaturedProduct = (productId: string) => {
    setContent((prev) => {
      const featuredIds = prev.products.featuredProductIds || []
      const isFeatured = featuredIds.includes(productId)
      return {
        ...prev,
        products: {
          ...prev.products,
          featuredProductIds: isFeatured
            ? featuredIds.filter((id) => id !== productId)
            : [...featuredIds, productId],
        },
      }
    })
  }

  const updateBenefits = (field: 'badgeText' | 'title' | 'buttonText' | 'buttonLink', value: string) => {
    setContent((prev) => ({
      ...prev,
      benefits: { ...prev.benefits, [field]: value },
    }))
  }

  const addBenefit = () => {
    setContent((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        benefits: [...prev.benefits.benefits, ''],
      },
    }))
  }

  const updateBenefit = (index: number, value: string) => {
    setContent((prev) => {
      const newBenefits = [...prev.benefits.benefits]
      newBenefits[index] = value
      return { ...prev, benefits: { ...prev.benefits, benefits: newBenefits } }
    })
  }

  const deleteBenefit = (index: number) => {
    setContent((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        benefits: prev.benefits.benefits.filter((_, i) => i !== index),
      },
    }))
  }

  const addStatCard = () => {
    setContent((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        statCards: [...prev.benefits.statCards, { value: '', label: '' }],
      },
    }))
  }

  const updateStatCard = (index: number, field: 'value' | 'label', value: string) => {
    setContent((prev) => {
      const newStatCards = [...prev.benefits.statCards]
      newStatCards[index] = { ...newStatCards[index], [field]: value }
      return { ...prev, benefits: { ...prev.benefits, statCards: newStatCards } }
    })
  }

  const deleteStatCard = (index: number) => {
    setContent((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        statCards: prev.benefits.statCards.filter((_, i) => i !== index),
      },
    }))
  }

  const updateTestimonials = (field: 'sectionTitle' | 'subtitle', value: string) => {
    setContent((prev) => ({
      ...prev,
      testimonials: { ...prev.testimonials, [field]: value },
    }))
  }

  const addTestimonial = () => {
    setContent((prev) => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        testimonials: [
          ...prev.testimonials.testimonials,
          { name: '', role: '', content: '', rating: 5 },
        ],
      },
    }))
  }

  const updateTestimonial = (
    index: number,
    field: 'name' | 'role' | 'content' | 'rating',
    value: string | number
  ) => {
    setContent((prev) => {
      const newTestimonials = [...prev.testimonials.testimonials]
      newTestimonials[index] = { ...newTestimonials[index], [field]: value }
      return { ...prev, testimonials: { ...prev.testimonials, testimonials: newTestimonials } }
    })
  }

  const deleteTestimonial = (index: number) => {
    setContent((prev) => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        testimonials: prev.testimonials.testimonials.filter((_, i) => i !== index),
      },
    }))
  }

  const updateGamingPC = (field: keyof HomepageContent['gamingPC'], value: string | HomepageContent['gamingPC']['stats']) => {
    setContent((prev) => ({
      ...prev,
      gamingPC: { ...prev.gamingPC, [field]: value },
    }))
  }

  const addGamingPCStat = () => {
    setContent((prev) => ({
      ...prev,
      gamingPC: {
        ...prev.gamingPC,
        stats: [...prev.gamingPC.stats, { label: '', value: '', color: 'text-primary' }],
      },
    }))
  }

  const updateGamingPCStat = (index: number, field: 'label' | 'value' | 'color', value: string) => {
    setContent((prev) => {
      const newStats = [...prev.gamingPC.stats]
      newStats[index] = { ...newStats[index], [field]: value }
      return { ...prev, gamingPC: { ...prev.gamingPC, stats: newStats } }
    })
  }

  const deleteGamingPCStat = (index: number) => {
    setContent((prev) => ({
      ...prev,
      gamingPC: {
        ...prev.gamingPC,
        stats: prev.gamingPC.stats.filter((_, i) => i !== index),
      },
    }))
  }

  const updatePerformance = (field: keyof HomepageContent['performance'], value: string) => {
    setContent((prev) => ({
      ...prev,
      performance: { ...prev.performance, [field]: value },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Home Content Editor
            </h1>
            <p className="text-muted-foreground mt-1">
              Edit all content displayed on the homepage
            </p>
          </div>
          <Button onClick={saveContent} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
              </>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          {(['hero', 'stats', 'gamingPC', 'performance', 'whyChoose', 'benefits', 'testimonials', 'products'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'hero'
                ? 'Hero'
                : tab === 'stats'
                ? 'Stats'
                : tab === 'gamingPC'
                ? 'Gaming PC'
                : tab === 'performance'
                ? 'Performance'
                : tab === 'whyChoose'
                ? 'Why Choose'
                : tab === 'benefits'
                ? 'Benefits'
                : tab === 'testimonials'
                ? 'Testimonials'
                : 'Products'}
            </button>
          ))}
        </div>

        {/* Hero Section */}
        {activeTab === 'hero' && (
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <p className="text-sm text-muted-foreground">
                Edit the main hero section content
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="badgeText">Badge Text</Label>
                <Input
                  id="badgeText"
                  value={content.hero.badgeText}
                  onChange={(e) => updateHero('badgeText', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="titlePart1">Title (Part 1)</Label>
                <Input
                  id="titlePart1"
                  value={content.hero.titlePart1}
                  onChange={(e) => updateHero('titlePart1', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="titleHighlighted">Title (Highlighted Part)</Label>
                <Input
                  id="titleHighlighted"
                  value={content.hero.titleHighlighted}
                  onChange={(e) => updateHero('titleHighlighted', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={content.hero.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateHero('description', e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="button1Text">Button 1 Text</Label>
                  <Input
                    id="button1Text"
                    value={content.hero.button1Text}
                    onChange={(e) => updateHero('button1Text', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="button1Link">Button 1 Link</Label>
                  <Input
                    id="button1Link"
                    value={content.hero.button1Link}
                    onChange={(e) => updateHero('button1Link', e.target.value)}
                    className="mt-1"
                    placeholder="/store or https://example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="button2Text">Button 2 Text</Label>
                  <Input
                    id="button2Text"
                    value={content.hero.button2Text}
                    onChange={(e) => updateHero('button2Text', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="button2Link">Button 2 Link</Label>
                  <Input
                    id="button2Link"
                    value={content.hero.button2Link}
                    onChange={(e) => updateHero('button2Link', e.target.value)}
                    className="mt-1"
                    placeholder="/store or https://example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gaming PC Section */}
        {activeTab === 'gamingPC' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gaming PC Section</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Edit the Gaming PC showcase section
                </p>
              </div>
              <Button onClick={addGamingPCStat} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Stat
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="gamingPCBadge">Badge Text</Label>
                <Input
                  id="gamingPCBadge"
                  value={content.gamingPC.badgeText}
                  onChange={(e) => updateGamingPC('badgeText', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="gamingPCTitle">Title</Label>
                <Input
                  id="gamingPCTitle"
                  value={content.gamingPC.title}
                  onChange={(e) => updateGamingPC('title', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="gamingPCDescription">Description</Label>
                <Textarea
                  id="gamingPCDescription"
                  value={content.gamingPC.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateGamingPC('description', e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gamingPCButtonText">Button Text</Label>
                  <Input
                    id="gamingPCButtonText"
                    value={content.gamingPC.buttonText}
                    onChange={(e) => updateGamingPC('buttonText', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gamingPCButtonLink">Button Link</Label>
                  <Input
                    id="gamingPCButtonLink"
                    value={content.gamingPC.buttonLink}
                    onChange={(e) => updateGamingPC('buttonLink', e.target.value)}
                    className="mt-1"
                    placeholder="/store or https://example.com"
                  />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Stats</h4>
                <div className="space-y-4">
                  {content.gamingPC.stats.map((stat, index) => (
                    <Card key={index} className="p-4 bg-muted/30">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold">Stat {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGamingPCStat(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Label</Label>
                          <Input
                            value={stat.label}
                            onChange={(e) => updateGamingPCStat(index, 'label', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Value</Label>
                          <Input
                            value={stat.value}
                            onChange={(e) => updateGamingPCStat(index, 'value', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Color Class</Label>
                          <Input
                            value={stat.color}
                            onChange={(e) => updateGamingPCStat(index, 'color', e.target.value)}
                            className="mt-1"
                            placeholder="text-blue-500"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Section */}
        {activeTab === 'performance' && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Section</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Edit the Performance Boost section with FPS graph
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="performanceBadge">Badge Text</Label>
                <Input
                  id="performanceBadge"
                  value={content.performance.badgeText}
                  onChange={(e) => updatePerformance('badgeText', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="performanceTitle">Title</Label>
                <Input
                  id="performanceTitle"
                  value={content.performance.title}
                  onChange={(e) => updatePerformance('title', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="performanceDescription">Description</Label>
                <Textarea
                  id="performanceDescription"
                  value={content.performance.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updatePerformance('description', e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="performanceButtonText">Button Text</Label>
                  <Input
                    id="performanceButtonText"
                    value={content.performance.buttonText}
                    onChange={(e) => updatePerformance('buttonText', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="performanceButtonLink">Button Link</Label>
                  <Input
                    id="performanceButtonLink"
                    value={content.performance.buttonLink}
                    onChange={(e) => updatePerformance('buttonLink', e.target.value)}
                    className="mt-1"
                    placeholder="/store or https://example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="performanceFPS">FPS Value</Label>
                  <Input
                    id="performanceFPS"
                    value={content.performance.fpsValue}
                    onChange={(e) => updatePerformance('fpsValue', e.target.value)}
                    className="mt-1"
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label htmlFor="performanceStability">Stability Value</Label>
                  <Input
                    id="performanceStability"
                    value={content.performance.stabilityValue}
                    onChange={(e) => updatePerformance('stabilityValue', e.target.value)}
                    className="mt-1"
                    placeholder="99%"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="performanceBeforeFPS">Before FPS Range</Label>
                  <Input
                    id="performanceBeforeFPS"
                    value={content.performance.beforeFPS}
                    onChange={(e) => updatePerformance('beforeFPS', e.target.value)}
                    className="mt-1"
                    placeholder="45-100 FPS"
                  />
                </div>
                <div>
                  <Label htmlFor="performanceAfterFPS">After FPS Range</Label>
                  <Input
                    id="performanceAfterFPS"
                    value={content.performance.afterFPS}
                    onChange={(e) => updatePerformance('afterFPS', e.target.value)}
                    className="mt-1"
                    placeholder="115-120 FPS"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="performanceBeforeLabel">Before Label</Label>
                  <Input
                    id="performanceBeforeLabel"
                    value={content.performance.beforeLabel}
                    onChange={(e) => updatePerformance('beforeLabel', e.target.value)}
                    className="mt-1"
                    placeholder="Before (Unstable)"
                  />
                </div>
                <div>
                  <Label htmlFor="performanceAfterLabel">After Label</Label>
                  <Input
                    id="performanceAfterLabel"
                    value={content.performance.afterLabel}
                    onChange={(e) => updatePerformance('afterLabel', e.target.value)}
                    className="mt-1"
                    placeholder="After (Stable)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Section */}
        {activeTab === 'stats' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Statistics</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Edit the statistics displayed in the hero section
                </p>
              </div>
              <Button onClick={addStat} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Stat
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.stats.map((stat, index) => (
                <Card key={index} className="p-4 bg-muted/30">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold">Stat {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteStat(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={stat.value}
                        onChange={(e) => updateStat(index, 'value', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Suffix</Label>
                      <Input
                        value={stat.suffix}
                        onChange={(e) => updateStat(index, 'suffix', e.target.value)}
                        className="mt-1"
                        placeholder="+"
                      />
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) => updateStat(index, 'label', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Why Choose Section */}
        {activeTab === 'whyChoose' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Why Choose Section</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Edit the &apos;Why Choose Our PC Optimization Software&apos; section
                </p>
              </div>
              <Button onClick={addFeature} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Feature
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="whyChooseTitle">Section Title</Label>
                <Input
                  id="whyChooseTitle"
                  value={content.whyChoose.sectionTitle}
                  onChange={(e) => updateWhyChoose('sectionTitle', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="whyChooseSubtitle">Subtitle</Label>
                <Input
                  id="whyChooseSubtitle"
                  value={content.whyChoose.subtitle}
                  onChange={(e) => updateWhyChoose('subtitle', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <div className="space-y-4">
                  {content.whyChoose.features.map((feature, index) => (
                    <Card key={index} className="p-4 bg-muted/30">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold">Feature {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFeature(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={feature.title}
                            onChange={(e) =>
                              updateFeature(index, 'title', e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={feature.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              updateFeature(index, 'description', e.target.value)
                            }
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Feature Items (one per line)</Label>
                          <Textarea
                            value={feature.featureItems.join('\n')}
                            onChange={(e) =>
                              updateFeature(
                                index,
                                'featureItems',
                                e.target.value.split('\n').filter((line: string) => line.trim())
                              )
                            }
                            rows={4}
                            className="mt-1"
                            placeholder="Premium Materials&#10;Precision Engineering&#10;Quality Assurance"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        {activeTab === 'benefits' && (
          <Card>
            <CardHeader>
              <CardTitle>Benefits Section</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Edit the benefits and stat cards section
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="benefitsBadge">Badge Text</Label>
                <Input
                  id="benefitsBadge"
                  value={content.benefits.badgeText}
                  onChange={(e) => updateBenefits('badgeText', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="benefitsTitle">Title</Label>
                <Input
                  id="benefitsTitle"
                  value={content.benefits.title}
                  onChange={(e) => updateBenefits('title', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Benefits List</h4>
                  <Button onClick={addBenefit} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Benefit
                  </Button>
                </div>
                <div className="space-y-3">
                  {content.benefits.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBenefit(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="benefitsButtonText">Button Text</Label>
                  <Input
                    id="benefitsButtonText"
                    value={content.benefits.buttonText}
                    onChange={(e) => updateBenefits('buttonText', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="benefitsButtonLink">Button Link</Label>
                  <Input
                    id="benefitsButtonLink"
                    value={content.benefits.buttonLink}
                    onChange={(e) => updateBenefits('buttonLink', e.target.value)}
                    className="mt-1"
                    placeholder="/store or https://example.com"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Stat Cards</h4>
                  <Button onClick={addStatCard} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stat Card
                  </Button>
                </div>
                <div className="space-y-4">
                  {content.benefits.statCards.map((card, index) => (
                    <Card key={index} className="p-4 bg-muted/30">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold">Stat Card {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteStatCard(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Value</Label>
                          <Input
                            value={card.value}
                            onChange={(e) => updateStatCard(index, 'value', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Label</Label>
                          <Input
                            value={card.label}
                            onChange={(e) => updateStatCard(index, 'label', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Testimonials Section */}
        {activeTab === 'testimonials' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Testimonials Section</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Edit the customer testimonials section
                </p>
              </div>
              <Button onClick={addTestimonial} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Testimonial
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="testimonialsTitle">Section Title</Label>
                <Input
                  id="testimonialsTitle"
                  value={content.testimonials.sectionTitle}
                  onChange={(e) => updateTestimonials('sectionTitle', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="testimonialsSubtitle">Subtitle</Label>
                <Input
                  id="testimonialsSubtitle"
                  value={content.testimonials.subtitle}
                  onChange={(e) => updateTestimonials('subtitle', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <h4 className="font-semibold mb-4">Testimonials</h4>
                <div className="space-y-4">
                  {content.testimonials.testimonials.map((testimonial, index) => (
                    <Card key={index} className="p-4 bg-muted/30">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold">Testimonial {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTestimonial(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={testimonial.name}
                              onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Role</Label>
                            <Input
                              value={testimonial.role}
                              onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea
                            value={testimonial.content}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              updateTestimonial(index, 'content', e.target.value)
                            }
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Rating (1-5)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={testimonial.rating}
                            onChange={(e) =>
                              updateTestimonial(index, 'rating', parseInt(e.target.value) || 5)
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Section */}
        {activeTab === 'products' && (
          <Card>
            <CardHeader>
              <CardTitle>Featured Products</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select which products to display in the featured section
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="productsTitle">Section Title</Label>
                <Input
                  id="productsTitle"
                  value={content.products.sectionTitle}
                  onChange={(e) => updateProducts('sectionTitle', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="productsSubtitle">Subtitle</Label>
                <Input
                  id="productsSubtitle"
                  value={content.products.subtitle}
                  onChange={(e) => updateProducts('subtitle', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <h4 className="font-semibold mb-4">Select Featured Products</h4>
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto border rounded-lg p-4 bg-muted/30">
                    {products.map((product) => {
                      const isFeatured = content.products.featuredProductIds?.includes(product.id) || false
                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={isFeatured}
                            onCheckedChange={() => toggleFeaturedProduct(product.id)}
                          />
                          <label
                            htmlFor={`product-${product.id}`}
                            className="flex-1 flex items-center gap-3 cursor-pointer"
                          >
                            {product.image && (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-cover rounded"
                                loading="lazy"
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-foreground">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.currency} {product.price.toFixed(2)}
                                {product.stock !== undefined && (
                                  <span className="ml-2">
                                    • {product.stock} in stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      )
                    })}
                  </div>
                )}
                {content.products.featuredProductIds && content.products.featuredProductIds.length > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    {content.products.featuredProductIds.length} product{content.products.featuredProductIds.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
