import React, { useState } from 'react'

const Settings = () => {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    currency: 'USD'
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Settings saved successfully!')
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl lg:text-2xl font-semibold mb-6 text-green-600 dark:text-green-400">Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Enable notifications</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Two-factor authentication</span>
              </label>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Currency Preference</h3>
            <select 
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-colors duration-200"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <button className="text-red-500 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-colors duration-200">
              Delete Account
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Settings