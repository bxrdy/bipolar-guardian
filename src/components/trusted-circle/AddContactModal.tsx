import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type TrustedContact = Tables<'trusted_contacts'>;
type TrustedContactInsert = Omit<TablesInsert<'trusted_contacts'>, 'user_id'>;

interface NotificationPreferences {
  crisis: boolean;
  check_in: boolean;
  updates: boolean;
}

interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (contact: TrustedContactInsert) => Promise<void>;
  editingContact?: TrustedContact | null;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  open,
  onOpenChange,
  onSave,
  editingContact
}) => {
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    crisis_priority_level: 2,
    notification_preferences: {
      crisis: true,
      check_in: true,
      updates: false
    } as NotificationPreferences
  });

  // Populate form when editing
  useEffect(() => {
    if (editingContact) {
      const defaultPrefs = {
        crisis: true,
        check_in: true,
        updates: false
      };
      
      let preferences = defaultPrefs;
      if (editingContact.notification_preferences && typeof editingContact.notification_preferences === 'object') {
        preferences = {
          crisis: (editingContact.notification_preferences as any)?.crisis ?? true,
          check_in: (editingContact.notification_preferences as any)?.check_in ?? true,
          updates: (editingContact.notification_preferences as any)?.updates ?? false
        };
      }

      setFormData({
        name: editingContact.name,
        relationship: editingContact.relationship,
        phone: editingContact.phone || '',
        email: editingContact.email || '',
        crisis_priority_level: editingContact.crisis_priority_level || 2,
        notification_preferences: preferences
      });
    } else {
      // Reset form for new contact
      setFormData({
        name: '',
        relationship: '',
        phone: '',
        email: '',
        crisis_priority_level: 2,
        notification_preferences: {
          crisis: true,
          check_in: true,
          updates: false
        }
      });
    }
  }, [editingContact, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.relationship) {
      return;
    }

    try {
      await onSave({
        name: formData.name,
        relationship: formData.relationship,
        phone: formData.phone || null,
        email: formData.email || null,
        crisis_priority_level: formData.crisis_priority_level,
        notification_preferences: formData.notification_preferences as any
      });
      
      // Reset form
      setFormData({
        name: '',
        relationship: '',
        phone: '',
        email: '',
        crisis_priority_level: 2,
        notification_preferences: {
          crisis: true,
          check_in: true,
          updates: false
        }
      });
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Trusted Contact'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter contact name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship *</Label>
            <Select 
              value={formData.relationship} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family">Family Member</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="healthcare">Healthcare Provider</SelectItem>
                <SelectItem value="therapist">Therapist/Counselor</SelectItem>
                <SelectItem value="emergency">Emergency Contact</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label>Crisis Priority Level</Label>
            <Select 
              value={formData.crisis_priority_level.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, crisis_priority_level: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">High Priority (Contact first)</SelectItem>
                <SelectItem value="2">Medium Priority (Contact second)</SelectItem>
                <SelectItem value="3">Low Priority (Contact last)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="p-4">
            <h4 className="font-medium mb-3">Notification Preferences</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="crisis">Crisis Alerts</Label>
                <Switch
                  id="crisis"
                  checked={formData.notification_preferences.crisis}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notification_preferences: {
                        ...prev.notification_preferences,
                        crisis: checked
                      }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="checkin">Check-in Reminders</Label>
                <Switch
                  id="checkin"
                  checked={formData.notification_preferences.check_in}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notification_preferences: {
                        ...prev.notification_preferences,
                        check_in: checked
                      }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="updates">General Updates</Label>
                <Switch
                  id="updates"
                  checked={formData.notification_preferences.updates}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notification_preferences: {
                        ...prev.notification_preferences,
                        updates: checked
                      }
                    }))
                  }
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.relationship}>
              {editingContact ? 'Update Contact' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
