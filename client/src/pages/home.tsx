import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventCard } from "@/components/event-card";
import { AddEventModal } from "@/components/add-event-modal";
import { EditEventModal } from "@/components/edit-event-modal";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { EventDetailsModal } from "@/components/event-details-modal";
import { MiniCalendar } from "@/components/mini-calendar";
import { CalendarHeart, Plus, Search, CalendarDays, Calendar, List } from "lucide-react";
import { Event } from "@shared/schema";

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [deletingEventName, setDeletingEventName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [relationFilter, setRelationFilter] = useState('all');

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append('search', searchQuery);
  if (typeFilter !== 'all') queryParams.append('type', typeFilter);
  if (relationFilter !== 'all') queryParams.append('relation', relationFilter);

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/events?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/events/stats'],
    queryFn: async () => {
      const response = await fetch('/api/events/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleViewDetails = (event: Event) => {
    setViewingEvent(event);
    setShowDetailsModal(true);
  };

  const handleDelete = (id: number) => {
    const event = events.find(e => e.id === id);
    if (event) {
      setDeletingEventId(id);
      setDeletingEventName(event.personName);
      setShowDeleteModal(true);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
  };

  const handleRelationFilter = (relation: string) => {
    setRelationFilter(relation);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-coral rounded-xl flex items-center justify-center">
                <CalendarHeart className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-dark-grey">Memento</h1>
                <p className="text-sm text-gray-600">Remember what matters!</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-coral text-white hover:bg-coral/90 flex items-center space-x-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Event</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Stats */}
            <div className="flex gap-3 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-sky-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {stats?.upcomingThisWeek || 0}
                  </span>
                </div>
                <span className="text-xs text-gray-600">This Week</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-sky-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {stats?.upcomingThisMonth || 0}
                  </span>
                </div>
                <span className="text-xs text-gray-600">This Month</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {stats?.totalEvents || 0}
                  </span>
                </div>
                <span className="text-xs text-gray-600">Total Events</span>
              </div>
            </div>

            {/* Search and Filter */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search events or people..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={handleTypeFilter}>
                      <SelectTrigger className="min-w-[120px]">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="birthday">Birthdays</SelectItem>
                        <SelectItem value="anniversary">Anniversaries</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={relationFilter} onValueChange={handleRelationFilter}>
                      <SelectTrigger className="min-w-[120px]">
                        <SelectValue placeholder="All Relations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Relations</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="colleague">Colleague</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Events List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-dark-grey">Upcoming Events</h2>
              </div>

              {events.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CalendarHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery || typeFilter !== 'all' || relationFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Get started by adding your first event'}
                    </p>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      className="bg-coral text-white hover:bg-coral/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClick={handleViewDetails}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Calendar Widget */}
            <MiniCalendar events={events} />



            {/* Event Categories */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-dark-grey mb-4">Event Categories</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-coral rounded-full"></div>
                      <span className="text-sm text-dark-grey">Birthdays</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {stats?.birthdayCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-teal rounded-full"></div>
                      <span className="text-sm text-dark-grey">Anniversaries</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {stats?.anniversaryCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple rounded-full"></div>
                      <span className="text-sm text-dark-grey">Other</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {stats?.otherCount || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddEventModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
      
      <EditEventModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        event={editingEvent}
      />
      
      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        eventId={deletingEventId}
        eventName={deletingEventName}
      />
      
      <EventDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        event={viewingEvent}
        onEdit={handleEdit}
      />
    </div>
  );
}
