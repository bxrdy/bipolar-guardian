/**
 * Motion Showcase Component - Demonstrates Apple-style animations
 * This component can be used for testing and demonstrating all the new motion features
 */

import * as React from "react"
import { motion } from "framer-motion"
import { MotionButton } from "@/components/ui/motion/motion-button"
import { MotionCard, MotionCardHeader, MotionCardTitle, MotionCardDescription, MotionCardContent } from "@/components/ui/motion/motion-card"
import { MotionDialog, MotionDialogContent, MotionDialogHeader, MotionDialogTitle, MotionDialogDescription, MotionDialogTrigger } from "@/components/ui/motion/motion-dialog"
import { SkeletonCard, SkeletonList, SkeletonChart } from "@/components/ui/motion/motion-skeleton"
import MotionMoodSelector from "@/components/mood/MotionMoodSelector"
import PageTransition from "@/components/transitions/PageTransition"
import { staggerContainer, staggerItem } from "@/lib/motion"
import { useMotionPreferences } from "@/hooks/useReducedMotion"

const MotionShowcase: React.FC = () => {
  const [selectedMood, setSelectedMood] = React.useState(5)
  const [showSkeletons, setShowSkeletons] = React.useState(false)
  const [currentScreen, setCurrentScreen] = React.useState<'dashboard' | 'settings'>('dashboard')
  const { disableAnimation, setDisableAnimation } = useMotionPreferences()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="text-center space-y-4"
      >
        <motion.h1 
          variants={staggerItem}
          className="text-display-medium font-bold text-foreground"
        >
          Motion Showcase
        </motion.h1>
        <motion.p 
          variants={staggerItem}
          className="text-body-large text-apple-gray-600 dark:text-apple-gray-400"
        >
          Demonstrating Apple-style animations and micro-interactions
        </motion.p>
      </motion.div>

      {/* Motion Controls */}
      <motion.div variants={staggerItem} className="flex flex-wrap gap-4 justify-center">
        <MotionButton
          variant="tinted"
          onClick={() => setDisableAnimation(!disableAnimation)}
        >
          {disableAnimation ? 'Enable' : 'Disable'} Animations
        </MotionButton>
        <MotionButton
          variant="outline"
          onClick={() => setShowSkeletons(!showSkeletons)}
        >
          {showSkeletons ? 'Hide' : 'Show'} Skeletons
        </MotionButton>
        <MotionButton
          variant="secondary"
          onClick={() => setCurrentScreen(currentScreen === 'dashboard' ? 'settings' : 'dashboard')}
        >
          Toggle Screen ({currentScreen})
        </MotionButton>
      </motion.div>

      {/* Button Variants */}
      <motion.section variants={staggerItem} className="space-y-4">
        <h2 className="text-headline-medium font-semibold">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <MotionButton variant="default">Default</MotionButton>
          <MotionButton variant="destructive">Destructive</MotionButton>
          <MotionButton variant="tinted">Tinted</MotionButton>
          <MotionButton variant="plain">Plain</MotionButton>
          <MotionButton variant="outline">Outline</MotionButton>
          <MotionButton variant="secondary">Secondary</MotionButton>
          <MotionButton variant="ghost">Ghost</MotionButton>
        </div>
      </motion.section>

      {/* Card Interactions */}
      <motion.section variants={staggerItem} className="space-y-4">
        <h2 className="text-headline-medium font-semibold">Interactive Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MotionCard variant="default" interactive>
            <MotionCardHeader>
              <MotionCardTitle>Default Card</MotionCardTitle>
              <MotionCardDescription>Hover and click for interactions</MotionCardDescription>
            </MotionCardHeader>
          </MotionCard>
          
          <MotionCard variant="elevated" interactive>
            <MotionCardHeader>
              <MotionCardTitle>Elevated Card</MotionCardTitle>
              <MotionCardDescription>Enhanced shadow elevation</MotionCardDescription>
            </MotionCardHeader>
          </MotionCard>
          
          <MotionCard variant="inset" interactive>
            <MotionCardHeader>
              <MotionCardTitle>Inset Card</MotionCardTitle>
              <MotionCardDescription>iOS-style inset design</MotionCardDescription>
            </MotionCardHeader>
          </MotionCard>
        </div>
      </motion.section>

      {/* Modal Example */}
      <motion.section variants={staggerItem} className="space-y-4">
        <h2 className="text-headline-medium font-semibold">Modal Animations</h2>
        <MotionDialog>
          <MotionDialogTrigger asChild>
            <MotionButton variant="default">Open Modal</MotionButton>
          </MotionDialogTrigger>
          <MotionDialogContent>
            <MotionDialogHeader>
              <MotionDialogTitle>Motion Dialog</MotionDialogTitle>
              <MotionDialogDescription>
                This modal uses Apple-style spring animations for a smooth, natural feel.
              </MotionDialogDescription>
            </MotionDialogHeader>
          </MotionDialogContent>
        </MotionDialog>
      </motion.section>

      {/* Mood Selector */}
      <motion.section variants={staggerItem} className="space-y-4">
        <h2 className="text-headline-medium font-semibold">Enhanced Mood Selector</h2>
        <MotionCard className="max-w-md mx-auto">
          <MotionCardContent className="pt-6">
            <MotionMoodSelector
              selectedMood={selectedMood}
              onMoodChange={setSelectedMood}
            />
          </MotionCardContent>
        </MotionCard>
      </motion.section>

      {/* Page Transitions */}
      <motion.section variants={staggerItem} className="space-y-4">
        <h2 className="text-headline-medium font-semibold">Page Transitions</h2>
        <MotionCard>
          <MotionCardContent className="pt-6">
            <PageTransition currentScreen={currentScreen}>
              <div className="text-center p-8">
                <h3 className="text-title-large font-semibold mb-2">
                  {currentScreen === 'dashboard' ? 'Dashboard Screen' : 'Settings Screen'}
                </h3>
                <p className="text-body-medium text-apple-gray-600 dark:text-apple-gray-400">
                  Click "Toggle Screen" to see the transition animation
                </p>
              </div>
            </PageTransition>
          </MotionCardContent>
        </MotionCard>
      </motion.section>

      {/* Loading Skeletons */}
      {showSkeletons && (
        <motion.section variants={staggerItem} className="space-y-4">
          <h2 className="text-headline-medium font-semibold">Loading Animations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-title-medium font-medium">Card Skeleton</h3>
              <SkeletonCard />
            </div>
            <div className="space-y-4">
              <h3 className="text-title-medium font-medium">Chart Skeleton</h3>
              <SkeletonChart />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-title-medium font-medium">List Skeleton</h3>
            <SkeletonList items={3} />
          </div>
        </motion.section>
      )}

      {/* Performance Note */}
      <motion.div variants={staggerItem} className="text-center">
        <MotionCard variant="inset" className="max-w-md mx-auto">
          <MotionCardContent className="pt-6">
            <p className="text-body-small text-apple-gray-600 dark:text-apple-gray-400">
              All animations respect the <code>prefers-reduced-motion</code> setting and can be disabled globally.
            </p>
          </MotionCardContent>
        </MotionCard>
      </motion.div>
    </div>
  )
}

export default MotionShowcase