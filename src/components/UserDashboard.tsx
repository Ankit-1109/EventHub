import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Certificate } from '../types';
import { Award, CheckCircle, XCircle, Search, User, LogOut, Save } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [verifyNumber, setVerifyNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState<Certificate | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '' });
  const [isUpdating, setIsUpdating] = useState(false);

  // Load user's certificates
  useEffect(() => {
    const storedCertificates = localStorage.getItem('app_certificates');
    if (storedCertificates) {
      const allCertificates: Certificate[] = JSON.parse(storedCertificates);
      // Filter certificates for current user
      const userCertificates = allCertificates.filter(c => c.userId === user?.id);
      setCertificates(userCertificates);
    }
  }, [user]);

  // Verify certificate authenticity
  const handleVerifyCertificate = () => {
    const storedCertificates = localStorage.getItem('app_certificates');
    if (!storedCertificates) {
      setVerificationResult(null);
      return;
    }

    const allCertificates: Certificate[] = JSON.parse(storedCertificates);
    const found = allCertificates.find(c => c.certificateNumber === verifyNumber.trim());

    setVerificationResult(found || null);
  };

  // Update user profile
  const handleUpdateProfile = async () => {
    if (!profileForm.fullName.trim()) return;

    setIsUpdating(true);
    try {
      await updateProfile(profileForm.fullName);
      setShowProfileModal(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get delivery status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sent':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.fullName}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setProfileForm({ fullName: user?.fullName || '' });
                  setShowProfileModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Certificates</p>
                <p className="text-3xl font-bold text-white mt-1">{certificates.length}</p>
              </div>
              <Award className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Verified</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {certificates.filter(c => c.verified).length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Delivered</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {certificates.filter(c => c.deliveryStatus === 'delivered').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>
        </div>

        {/* My Certificates Section */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">My Certificates</h2>
          </div>

          <div className="p-6">
            {certificates.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">You don't have any certificates yet.</p>
                <p className="text-gray-500 text-sm mt-2">
                  Certificates will appear here once they are issued to you.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map(cert => (
                  <div
                    key={cert.id}
                    className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 border border-gray-600 hover:border-blue-500 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Award className="w-8 h-8 text-blue-400" />
                      {cert.verified ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">{cert.eventTitle}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-gray-400">Certificate Number</div>
                      <div className="text-sm font-mono text-blue-400 bg-gray-900/50 px-3 py-2 rounded">
                        {cert.certificateNumber}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(cert.deliveryStatus)}`}>
                        {cert.deliveryStatus.charAt(0).toUpperCase() + cert.deliveryStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Certificate Verification Section */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Verify Certificate</h2>
              <p className="text-gray-400 text-sm mt-1">
                Check the authenticity of any certificate
              </p>
            </div>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Search className="w-4 h-4" />
              Verify
            </button>
          </div>

          <div className="p-6">
            <div className="max-w-2xl">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={verifyNumber}
                  onChange={(e) => setVerifyNumber(e.target.value)}
                  placeholder="Enter certificate number (e.g., CERT-1234567890-ABC)"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleVerifyCertificate}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  Verify
                </button>
              </div>

              {verifyNumber && (
                <div className="mt-6">
                  {verificationResult ? (
                    <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-green-400 mb-2">
                            Certificate Verified!
                          </h3>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-300">
                              <span className="text-gray-400">Event:</span> {verificationResult.eventTitle}
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-400">Certificate #:</span>{' '}
                              <span className="font-mono">{verificationResult.certificateNumber}</span>
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-400">Issued:</span>{' '}
                              {new Date(verificationResult.issuedAt).toLocaleDateString()}
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-400">Status:</span>{' '}
                              <span className="capitalize">{verificationResult.deliveryStatus}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-semibold text-red-400 mb-2">
                            Certificate Not Found
                          </h3>
                          <p className="text-gray-300 text-sm">
                            The certificate number you entered could not be verified. Please check the number and try again.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Update Profile</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ fullName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
