import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, SortAsc, Grid, List } from 'lucide-react';

interface SearchAndFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  relationshipFilter: string;
  onRelationshipFilterChange: (relationship: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onClearFilters: () => void;
  totalContacts: number;
  filteredCount: number;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  relationshipFilter,
  onRelationshipFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onClearFilters,
  totalContacts,
  filteredCount
}) => {
  const hasActiveFilters = statusFilter !== 'all' || relationshipFilter !== 'all' || priorityFilter !== 'all' || searchQuery;

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts by name or relationship..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <div className="flex items-center gap-1 flex-shrink-0">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium whitespace-nowrap">Filters:</span>
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-28 h-8">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>

        <Select value={relationshipFilter} onValueChange={onRelationshipFilterChange}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="friend">Friend</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="therapist">Therapist</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger className="w-28 h-8">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="1">High</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">Low</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 flex-shrink-0">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="relationship">Type</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-8 flex-shrink-0"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredCount} of {totalContacts} contact{totalContacts !== 1 ? 's' : ''}
        </span>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 text-xs"
          >
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  );
};