
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Shield, Heart, Sparkles } from 'lucide-react';
import { useTrustedContacts } from '@/hooks/useTrustedContacts';
import { EnhancedContactCard } from './EnhancedContactCard';
import { AddContactModal } from './AddContactModal';
import { SearchAndFilterBar } from './SearchAndFilterBar';
import { ContactsStats } from './ContactsStats';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type TrustedContact = Tables<'trusted_contacts'>;
type TrustedContactInsert = Omit<TablesInsert<'trusted_contacts'>, 'user_id'>;

export const TrustedCircleSetup: React.FC = () => {
  const { contacts, loading, addContact, updateContact, deleteContact } = useTrustedContacts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [relationshipFilter, setRelationshipFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtered and sorted contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           contact.relationship.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || contact.verification_status === statusFilter;
      const matchesRelationship = relationshipFilter === 'all' || contact.relationship === relationshipFilter;
      const matchesPriority = priorityFilter === 'all' || contact.crisis_priority_level?.toString() === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesRelationship && matchesPriority;
    });

    // Sort contacts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'priority':
          return (a.crisis_priority_level || 3) - (b.crisis_priority_level || 3);
        case 'relationship':
          return a.relationship.localeCompare(b.relationship);
        case 'status':
          const statusOrder = { verified: 0, pending: 1, declined: 2 };
          return (statusOrder[a.verification_status as keyof typeof statusOrder] || 3) - 
                 (statusOrder[b.verification_status as keyof typeof statusOrder] || 3);
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [contacts, searchQuery, statusFilter, relationshipFilter, priorityFilter, sortBy]);

  const handleEdit = (contact: TrustedContact) => {
    setEditingContact(contact);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this trusted contact?')) {
      await deleteContact(id);
    }
  };

  const handleSave = async (contactData: TrustedContactInsert) => {
    try {
      if (editingContact) {
        await updateContact(editingContact.id, contactData);
      } else {
        await addContact(contactData);
      }
      setShowAddModal(false);
      setEditingContact(null);
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setRelationshipFilter('all');
    setPriorityFilter('all');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-gradient-to-r from-muted/50 to-muted rounded-xl animate-pulse" />
        <div className="h-16 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                <Shield className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  Your Trusted Circle
                  <Sparkles className="h-5 w-5 text-primary" />
                </h1>
                <p className="text-muted-foreground">People who can support you when you need help</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowAddModal(true)} 
              className="bg-primary hover:bg-primary/90 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>
      </Card>

      {contacts.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center bg-gradient-to-br from-muted/30 to-muted/10">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Build Your Support Network</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Add family, friends, and healthcare providers who can be there for you during difficult times. 
              Having a trusted circle is essential for your wellbeing.
            </p>
            <Button 
              onClick={() => setShowAddModal(true)} 
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Contact
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats Dashboard */}
          <ContactsStats contacts={contacts} />

          {/* Search and Filter Bar */}
          <SearchAndFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            relationshipFilter={relationshipFilter}
            onRelationshipFilterChange={setRelationshipFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onClearFilters={handleClearFilters}
            totalContacts={contacts.length}
            filteredCount={filteredContacts.length}
          />

          {/* Contacts Grid/List */}
          {filteredContacts.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">No contacts match your filters</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or clearing the filters.
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4" 
                : "space-y-4"
            )}>
              {filteredContacts.map((contact) => (
                <EnhancedContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <AddContactModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingContact(null);
        }}
        onSave={handleSave}
        editingContact={editingContact}
      />
    </div>
  );
};
