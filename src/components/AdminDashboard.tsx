import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Event, Certificate } from '../types';
import { Calendar, Plus, Trash2, CreditCard as Edit2, Award, Package, CheckCircle, XCircle, LogOut } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventDate: '',
  });

  // Load data from localStorage
  useEffect(() => {
    const storedEvents = localStorage.getItem('app_events');
    const storedCertificates = localStorage.getItem('app_certificates');

    if (storedEvents) setEvents(JSON.parse(storedEvents));
    if (storedCertificates) setCertificates(JSON.parse(storedCertificates));
  }, []);

  // Save events to localStorage
  const saveEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
    localStorage.setItem('app_events', JSON.stringify(newEvents));
  };

  // Save certificates to localStorage
  const saveCertificates = (newCertificates: Certificate[]) => {
    setCertificates(newCertificates);
    localStorage.setItem('app_certificates', JSON.stringify(newCertificates));
  };

  // Create or update event
  const handleSaveEvent = () => {
    if (!eventForm.title || !eventForm.eventDate) return;

    if (editingEvent) {
      // Update existing event
      const updatedEvents = events.map(e =>
        e.id === editingEvent.id
          ? { ...e, ...eventForm }
          : e
      );
      saveEvents(updatedEvents);
    } else {
      // Create new event
      const newEvent: Event = {
        id: crypto.randomUUID(),
        ...eventForm,
        createdBy: user!.id,
        createdAt: new Date().toISOString(),
      };
      saveEvents([...events, newEvent]);
    }

    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm({ title: '', description: '', eventDate: '' });
  };

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const updatedEvents = events.filter(e => e.id !== eventId);
    saveEvents(updatedEvents);

    // Also delete associated certificates
    const updatedCertificates = certificates.filter(c => c.eventId !== eventId);
    saveCertificates(updatedCertificates);
  };

  // Generate certificate for a user
  const handleGenerateCertificate = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Get all users
    const usersData = localStorage.getItem('app_users');
    const users = usersData ? JSON.parse(usersData) : [];
    const regularUsers = users.filter((u: any) => u.role === 'user');

    if (regularUsers.length === 0) {
      alert('No users available to issue certificates');
      return;
    }

    // For demo, issue to first user
    const targetUser = regularUsers[0];

    const newCertificate: Certificate = {
      id: crypto.randomUUID(),
      eventId: event.id,
      userId: targetUser.id,
      certificateNumber: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      issuedAt: new Date().toISOString(),
      verified: true,
      deliveryStatus: 'pending',
      eventTitle: event.title,
    };

    saveCertificates([...certificates, newCertificate]);
    alert(`Certificate generated for ${targetUser.fullName}`);
  };

  // Update certificate delivery status
  const handleUpdateDeliveryStatus = (certId: string, status: 'pending' | 'sent' | 'delivered') => {
    const updatedCertificates = certificates.map(c =>
      c.id === certId ? { ...c, deliveryStatus: status } : c
    );
    saveCertificates(updatedCertificates);
  };

  // Open edit modal
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
    });
    setShowEventModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.fullName}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-white mt-1">{events.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Certificates Issued</p>
                <p className="text-3xl font-bold text-white mt-1">{certificates.length}</p>
              </div>
              <Award className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Delivery</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {certificates.filter(c => c.deliveryStatus === 'pending').length}
                </p>
              </div>
              <Package className="w-12 h-12 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Event Management</h2>
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventForm({ title: '', description: '', eventDate: '' });
                setShowEventModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          </div>

          <div className="p-6">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No events yet. Create your first event!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{event.description}</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Date: {new Date(event.eventDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleGenerateCertificate(event.id)}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                          title="Generate Certificate"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                          title="Edit Event"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Certificates Section */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Certificate Delivery Tracking</h2>
          </div>

          <div className="p-6">
            {certificates.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No certificates issued yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Certificate #</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Event</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Verified</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map(cert => (
                      <tr key={cert.id} className="border-b border-gray-700/50">
                        <td className="py-3 px-4 text-white text-sm font-mono">{cert.certificateNumber}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">{cert.eventTitle}</td>
                        <td className="py-3 px-4">
                          <select
                            value={cert.deliveryStatus}
                            onChange={(e) => handleUpdateDeliveryStatus(cert.id, e.target.value as any)}
                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="sent">Sent</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          {cert.verified ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            cert.deliveryStatus === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            cert.deliveryStatus === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {cert.deliveryStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Web Development Workshop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Event details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Date</label>
                <input
                  type="date"
                  value={eventForm.eventDate}
                  onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                  setEventForm({ title: '', description: '', eventDate: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                {editingEvent ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
