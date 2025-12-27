import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Save,
  HardDrive,
  User,
  Building2,
  Clock,
  Diamond
} from 'lucide-react';

const NewRequestForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: '',
    employee: '',
    technician: '',
    category: 'computer',
    status: 'New Request',
    company: 'My Company',
    maintenanceType: 'Corrective',
    priority: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: API call / save logic here
    console.log('Saved request:', { ...formData, id: Date.now() });

    // Redirect to dashboard after save
    navigate('/dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="group flex items-center text-gray-500 hover:text-indigo-400 transition-colors mb-2 text-sm font-medium"
            >
              <ChevronLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Discard & Back
            </button>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Create New Request
            </h1>
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            <Save size={20} />
            <span>Save Request</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Subject */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                    Subject
                  </label>
                  <input
                    name="subject"
                    required
                    placeholder="e.g., Laptop Screen Repair"
                    className="w-full bg-transparent border-b border-gray-700 focus:border-indigo-500 outline-none pb-2 text-xl font-bold text-white placeholder-gray-700 transition-colors"
                    onChange={handleChange}
                  />
                </div>

                <InputField
                  label="Created By"
                  name="employee"
                  placeholder="Employee Name"
                  icon={<User size={14} />}
                  onChange={handleChange}
                />

                <InputField
                  label="Category"
                  name="category"
                  placeholder="computer, infrastructure..."
                  onChange={handleChange}
                />

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                    <HardDrive size={14} /> Equipment Details
                  </label>
                  <input
                    name="equipment"
                    placeholder="Serial Number / Model"
                    className="w-full bg-transparent border-b border-gray-700 focus:border-indigo-500 outline-none pb-2 text-gray-100 placeholder-gray-700 transition-colors"
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2 pt-4">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 block">
                    Maintenance Type
                  </label>
                  <div className="flex gap-8">
                    <RadioOption
                      label="Corrective"
                      name="maintenanceType"
                      value="Corrective"
                      checked={formData.maintenanceType === 'Corrective'}
                      onChange={handleChange}
                    />
                    <RadioOption
                      label="Preventive"
                      name="maintenanceType"
                      value="Preventive"
                      checked={formData.maintenanceType === 'Preventive'}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex border-b border-gray-700/30 bg-gray-900/20 px-8 py-4">
                <span className="text-sm font-bold text-indigo-400">
                  Initial Notes
                </span>
              </div>
              <div className="p-8">
                <textarea
                  name="notes"
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-300 placeholder-gray-700 h-32 resize-none text-lg"
                  placeholder="Describe the issue in detail..."
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl p-8 shadow-2xl space-y-8">
              <InputField
                label="Technician"
                name="technician"
                placeholder="Assign Technician"
                icon={<User size={14} />}
                onChange={handleChange}
              />

              <InputField
                label="Scheduled Date"
                name="scheduledDate"
                type="datetime-local"
                icon={<Clock size={14} />}
                onChange={handleChange}
              />

              <InputField
                label="Company"
                name="company"
                placeholder="Branch location"
                icon={<Building2 size={14} />}
                onChange={handleChange}
              />

              <div className="pt-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 block">
                  Priority Level
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, priority: p }))
                      }
                      className={`transition-all ${
                        formData.priority >= p
                          ? 'text-indigo-500'
                          : 'text-gray-700'
                      }`}
                    >
                      <Diamond
                        size={28}
                        fill={
                          formData.priority >= p ? 'currentColor' : 'none'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

/* Helpers */
const InputField = ({ label, icon, isCapitalize, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
      {icon} {label}
    </label>
    <input
      {...props}
      className={`w-full bg-transparent border-b border-gray-700 focus:border-indigo-500 outline-none pb-2 text-gray-100 placeholder-gray-700 transition-colors ${
        isCapitalize ? 'capitalize' : ''
      }`}
    />
  </div>
);

const RadioOption = ({ label, ...props }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <input
      type="radio"
      {...props}
      className="w-4 h-4 text-indigo-600 bg-gray-900 border-gray-700 focus:ring-indigo-500 focus:ring-offset-gray-900"
    />
    <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
      {label}
    </span>
  </label>
);

export default NewRequestForm;
