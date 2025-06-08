import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, User, Mail, Lock, Calendar, MapPin, Phone, Download, Upload } from 'lucide-react';

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    birthdate: '',
    address: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  // Load existing users from uploaded CSV file
  useEffect(() => {
    loadExistingCSV();
  }, []);

  const loadExistingCSV = async () => {
    try {
      // Check if there's an existing CSV file uploaded
      const existingData = localStorage.getItem('userRegistrations');
      if (existingData) {
        const parsedData = JSON.parse(existingData);
        setUsers(parsedData);
      }
    } catch (error) {
      console.log('No existing CSV data found');
    }
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const existingUsers = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
            if (values.length >= 6) {
              existingUsers.push({
                username: values[0],
                email: values[1],
                password: values[2],
                birthdate: values[3],
                address: values[4],
                phone: values[5],
                registrationDate: values[6] || new Date().toISOString().split('T')[0]
              });
            }
          }
        }
        
        setUsers(existingUsers);
        localStorage.setItem('userRegistrations', JSON.stringify(existingUsers));
        setCsvFile(file);
      } catch (error) {
        alert('Error reading CSV file. Please make sure it\'s in the correct format.');
      }
    };
    reader.readAsText(file);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (users.some(user => user.email.toLowerCase() === formData.email.toLowerCase())) {
      newErrors.email = 'Email already exists';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.birthdate) {
      newErrors.birthdate = 'Birth date is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateCSV = (data) => {
    const headers = ['Username', 'Email', 'Password', 'Birth Date', 'Address', 'Phone Number', 'Registration Date'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row.username}"`,
        `"${row.email}"`,
        `"${row.password}"`,
        `"${row.birthdate}"`,
        `"${row.address}"`,
        `"${row.phone}"`,
        `"${row.registrationDate}"`
      ].join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      ...formData,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Save to localStorage for persistence
    localStorage.setItem('userRegistrations', JSON.stringify(updatedUsers));
    
    // Always download the same filename so it overwrites the previous file
    const csvContent = generateCSV(updatedUsers);
    downloadCSV(csvContent, 'users_database.csv');
    
    setShowSuccess(true);
    setIsSubmitting(false);
    
    // Reset form
    setFormData({
      username: '',
      email: '',
      password: '',
      birthdate: '',
      address: '',
      phone: ''
    });
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      birthdate: '',
      address: '',
      phone: ''
    });
    setErrors({});
  };

  const inputFields = [
    { name: 'username', label: 'Username', type: 'text', icon: User, placeholder: 'Enter your username' },
    { name: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'Enter your email' },
    { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Enter your password' },
    { name: 'birthdate', label: 'Birth Date', type: 'date', icon: Calendar },
    { name: 'address', label: 'Address', type: 'text', icon: MapPin, placeholder: 'Enter your address' },
    { name: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: 'Enter your phone number' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us today and get started!</p>
        </div>

        {/* CSV Upload Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <Upload className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-blue-800">Load Database</h3>
          </div>
          <p className="text-blue-600 text-sm mb-4">
            Upload your <strong>users_database.csv</strong> file to continue adding users. Each new registration will update this same file.
          </p>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="block w-full text-sm text-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            {csvFile && (
              <span className="text-green-600 text-sm flex items-center">
                <Check className="w-4 h-4 mr-1" />
                Database loaded
              </span>
            )}
          </div>
          {users.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                📁 <strong>{users.length}</strong> users in database. New registrations will be added to the same <strong>users_database.csv</strong> file.
              </p>
            </div>
          )}
          {users.length === 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                💡 No database loaded. Your first registration will create <strong>users_database.csv</strong>
              </p>
            </div>
          )}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-green-800 font-medium">Registration successful!</p>
              <p className="text-green-600 text-sm">Your data has been saved and CSV downloaded.</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="space-y-6">
              {inputFields.map(({ name, label, type, icon: Icon, placeholder }) => (
                <div key={name} className="space-y-2">
                  <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
                    {label}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={type}
                      id={name}
                      name={name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      placeholder={placeholder}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors[name] 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                  </div>
                  {errors[name] && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors[name]}
                    </div>
                  )}
                </div>
              ))}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Submit
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-center">
              <Download className="w-5 h-5 text-indigo-600 mr-2" />
              <span className="text-gray-700">
                <span className="font-semibold">{users.length}</span> users registered
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistrationForm;