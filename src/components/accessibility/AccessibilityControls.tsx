
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from './AccessibilityProvider';
import { Contrast, Volume, Type, Eye, RotateCcw, Zap } from 'lucide-react';

const AccessibilityControls: React.FC = () => {
  const {
    settings,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    setLineHeight,
    toggleFocusRingEnhanced,
    toggleColorBlindFriendly,
    resetToDefaults,
  } = useAccessibility();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Visual Settings</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="flex items-center gap-2">
              <Contrast className="w-4 h-4" />
              High Contrast Mode
            </Label>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={toggleHighContrast}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="color-blind-friendly" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Color Blind Friendly
            </Label>
            <Switch
              id="color-blind-friendly"
              checked={settings.colorBlindFriendly}
              onCheckedChange={toggleColorBlindFriendly}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enhanced-focus" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Enhanced Focus Rings
            </Label>
            <Switch
              id="enhanced-focus"
              checked={settings.focusRingEnhanced}
              onCheckedChange={toggleFocusRingEnhanced}
            />
          </div>
        </div>

        <Separator />

        {/* Typography Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Typography Settings</h3>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Font Size: {Math.round(settings.fontSize * 100)}%
            </Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => setFontSize(value)}
              min={0.8}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Volume className="w-4 h-4 rotate-90" />
              Line Height: {Math.round(settings.lineHeight * 100)}%
            </Label>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={([value]) => setLineHeight(value)}
              min={1.0}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* Motion Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Motion Settings</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="reduced-motion" className="flex items-center gap-2">
              <Volume className="w-4 h-4" />
              Reduce Motion
            </Label>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={toggleReducedMotion}
            />
          </div>
        </div>

        <Separator />

        {/* Reset Button */}
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="w-full flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilityControls;
