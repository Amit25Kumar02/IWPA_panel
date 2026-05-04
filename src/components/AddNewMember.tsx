import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { generateMembershipId } from "../utils/membershipId";

function PhoneInput({
  value, onChange, name, hasError,
}: {
  value: string; onChange: (v: string) => void; name: string; hasError?: boolean;
}) {
  const [countryCode, setCountryCode] = useState("+91");
  return (
    <div className={`flex border rounded-lg overflow-hidden ${hasError ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`}>
      <input
        type="text"
        value={countryCode}
        onChange={(e) => {
          const val = e.target.value;
          if (/^\+?\d{0,4}$/.test(val)) setCountryCode(val.startsWith("+") ? val : "+" + val.replace(/\+/g, ""));
        }}
        name={`${name}_cc`}
        autoComplete="off"
        className="w-14 px-2 py-2 bg-[#f9fafb] border-r border-[#e5e7eb] text-sm outline-none text-center"
        maxLength={5}
      />
      <input
        type="tel"
        name={name}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
        placeholder="XXXXXXXXXX"
        maxLength={10}
        className="flex-1 px-3 py-2 outline-none text-sm"
      />
    </div>
  );
}

const states = [
  "Andhra Pradesh",
  "Gujarat",
  "Karnataka",
  "Madhya Pradesh",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Other",
];

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const categories = [
  { code: "GEM", name: "Generator (Corporate)" },
  { code: "NGM", name: "Generator (Non-corporate)" },
  { code: "SRV", name: "Service Provider" },
  { code: "FIN", name: "Financial Institution" },
  { code: "SWO", name: "State Wind Owner" },
  { code: "EDU", name: "Educational Institution" },
  { code: "INT", name: "International Member" },
  { code: "MFG", name: "Manufacturer" },
  { code: "ANE", name: "Associate (Non-eligible)" },
];

interface WindRow {
  id: number;
  location: string;
  noOfWindMills: string;
  ratedCapacity: string;
  totalMW: string;
  make: string;
  connectedSubstation: string;
}

export default function AddNewMember({ onClose, initialData }: { onClose: () => void; initialData?: any }) {
  const [membershipId, setMembershipId] = useState("Generating...");

  useEffect(() => {
    api.get("/api/v1/members/get-members")
      .then((res) => {
        const members = Array.isArray(res.data?.data) ? res.data.data : [];
        const ids = members.map((m: any) => m.membershipId).filter(Boolean);
        setMembershipId(generateMembershipId(ids));
      })
      .catch(() => setMembershipId(generateMembershipId([])));
  }, []);

  const [formData, setFormData] = useState({
    state: "",
    category: "",
    year: new Date().getFullYear().toString(),
    serialNumber: "0001",
    companyName: "",
    address: "",
    officePhone: "",
    gstNo: "",
    repName: "",
    repDesignation: "",
    repOfficePhone: "",
    repMobile: "",
    repEmail: "",
    memberCategory: "generator",
    businessDescription: "",
    chairmanMD: "",
    groupCompany: "",
    addRepName: "",
    addRepDesignation: "",
    addRepOfficePhone: "",
    addRepMobile: "",
    addRepEmail: "",
  });

  const [countryCodes2, setCountryCodes2] = useState({
    officePhone: "+91",
    repOfficePhone: "+91",
    repMobile: "+91",
    addRepOfficePhone: "+91",
    addRepMobile: "+91",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (field: string, value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, [field]: digits }));
    setErrors((prev) => ({ ...prev, [field]: digits.length > 0 && digits.length < 10 ? "Must be 10 digits" : "" }));
  };

  const handleEmailChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: value && !validateEmail(value) ? "Invalid email" : "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) newErrors.companyName = "Required";
    if (!formData.repName.trim()) newErrors.repName = "Required";
    if (!formData.repDesignation.trim()) newErrors.repDesignation = "Required";
    if (!formData.repMobile || formData.repMobile.length !== 10) newErrors.repMobile = "Must be 10 digits";
    if (formData.repOfficePhone && formData.repOfficePhone.length !== 10) newErrors.repOfficePhone = "Must be 10 digits";
    if (!formData.repEmail || !validateEmail(formData.repEmail)) newErrors.repEmail = "Invalid email";
    if (formData.officePhone && formData.officePhone.length !== 10) newErrors.officePhone = "Must be 10 digits";
    if (formData.addRepMobile && formData.addRepMobile.length !== 10) newErrors.addRepMobile = "Must be 10 digits";
    if (formData.addRepOfficePhone && formData.addRepOfficePhone.length !== 10) newErrors.addRepOfficePhone = "Must be 10 digits";
    if (formData.addRepEmail && !validateEmail(formData.addRepEmail)) newErrors.addRepEmail = "Invalid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [windRows, setWindRows] = useState<WindRow[]>([
    {
      id: 1,
      location: "",
      noOfWindMills: "",
      ratedCapacity: "",
      totalMW: "",
      make: "",
      connectedSubstation: "",
    },
  ]);

  const addWindRow = () => {
    setWindRows([
      ...windRows,
      {
        id: Date.now(),
        location: "",
        noOfWindMills: "",
        ratedCapacity: "",
        totalMW: "",
        make: "",
        connectedSubstation: "",
      },
    ]);
  };

  const removeWindRow = (id: number) => {
    if (windRows.length > 1) {
      setWindRows(windRows.filter((row) => row.id !== id));
    }
  };

  const updateWindRow = (id: number, field: keyof WindRow, value: string) => {
    setWindRows(
      windRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };



  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await api.post("/api/v1/members/create-member", {
        membershipId,
        state: formData.state,
        category: formData.category,
        year: formData.year,
        serialNumber: formData.serialNumber,
        companyName: formData.companyName,
        address: formData.address,
        officePhone: formData.officePhone,
        gstNo: formData.gstNo,
        repName: formData.repName,
        repDesignation: formData.repDesignation,
        repOfficePhone: formData.repOfficePhone,
        repMobile: formData.repMobile,
        repEmail: formData.repEmail,
        memberCategory: formData.memberCategory,
        businessDescription: formData.businessDescription,
        chairmanMD: formData.chairmanMD,
        groupCompany: formData.groupCompany,
        addRepName: formData.addRepName,
        addRepDesignation: formData.addRepDesignation,
        addRepOfficePhone: formData.addRepOfficePhone,
        addRepMobile: formData.addRepMobile,
        addRepEmail: formData.addRepEmail,
        windDetails: windRows,
      });
      toast.success("Member registered successfully");
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create member");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await api.post("/api/v1/members/save-draft", { ...formData, windDetails: windRows });
      toast.info("Draft saved");
    } catch {
      toast.error("Failed to save draft");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-6xl mx-2 my-4 sm:m-4 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-[#e5e7eb]">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-[#242424]">Add New Member / Sign Up</h2>
            <p className="text-[#6a7282] mt-1 text-sm">Complete member registration form</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
          {/* Auto Configuration */}
          {/* <Section title="Auto Configuration">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Select State <span className="text-[#FB2C36]">*</span></Label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Select Category <span className="text-[#FB2C36]">*</span></Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.code} - {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Year of Joining</Label>
                <input
                  type="text"
                  value={formData.year}
                  readOnly
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg bg-[#f9fafb] cursor-not-allowed"
                />
              </div>
              <div>
                <Label>Serial Number</Label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg bg-[#f9fafb] cursor-not-allowed"
                />
              </div>
            </div>
          </Section> */}
          <div className="bg-linear-to-br from-[#ecfdf5] to-[#ffffff] rounded-lg border-[0.74px] border-[#a4f4cf] p-3 sm:p-4 mt-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#6a7282] mb-1">
                  Membership Number Preview
                </p>
                <p className="text-base sm:text-xl font-bold text-[#1F7A4D] font-mono break-all">
                  {membershipId}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#fef3c7] text-[#f59e0b]">
                  Temporary
                </span>
                <p className="text-xs text-[#6a7282] mt-1">
                  Permanent after payment
                </p>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <Section title="Company Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Company Name <span className="text-[#FB2C36]">*</span></Label>
                <input
                  type="text"
                  name="companyName"
                  autoComplete="off"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Enter company name"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Enter GROUP Company Name (if applicable)</Label>
                <input
                  type="text"
                  name="groupCompanyName"
                  autoComplete="off"
                  value={formData.groupCompany}
                  onChange={(e) => setFormData({ ...formData, groupCompany: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Enter Group company name"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Address for Correspondence (if applicable) </Label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Enter complete address"
                />
              </div>
              <div>
                <Label>Office Phone</Label>
                <PhoneInput
                  name="companyOfficePhone"
                  value={formData.officePhone}
                  onChange={(v) => handlePhoneChange("officePhone", v)}
                  hasError={!!errors.officePhone}
                />
                {errors.officePhone && <p className="text-xs text-[#FB2C36] mt-1">{errors.officePhone}</p>}
              </div>
              <div>
                <Label>GST No.</Label>
                <input
                  type="text"
                  name="gstNo"
                  autoComplete="off"
                  value={formData.gstNo}
                  onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Enter GST number"
                />
              </div>
            </div>
          </Section>

          {/* Authorized Representative */}
          <Section title="Authorized Representative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name <span className="text-[#FB2C36]">*</span></Label>
                <input
                  type="text"
                  name="repName"
                  autoComplete="off"
                  value={formData.repName}
                  placeholder="Enter name"
                  onChange={(e) => setFormData({ ...formData, repName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg outline-none ${errors.repName ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`}
                />
                {errors.repName && <p className="text-xs text-[#FB2C36] mt-1">{errors.repName}</p>}
              </div>
              <div>
                <Label>Designation <span className="text-[#FB2C36]">*</span></Label>
                <input
                  type="text"
                  name="repDesignation"
                  autoComplete="off"
                  value={formData.repDesignation}
                  placeholder="Enter designation"
                  onChange={(e) => setFormData({ ...formData, repDesignation: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg outline-none ${errors.repDesignation ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`}
                />
                {errors.repDesignation && <p className="text-xs text-[#FB2C36] mt-1">{errors.repDesignation}</p>}
              </div>
              <div>
                <Label>Office Phone</Label>
                <PhoneInput
                  name="repOfficePhone"
                  value={formData.repOfficePhone}
                  onChange={(v) => handlePhoneChange("repOfficePhone", v)}
                  hasError={!!errors.repOfficePhone}
                />
                {errors.repOfficePhone && <p className="text-xs text-[#FB2C36] mt-1">{errors.repOfficePhone}</p>}
              </div>
              <div>
                <Label>Mobile <span className="text-[#FB2C36]">*</span></Label>
                <PhoneInput
                  name="repMobile"
                  value={formData.repMobile}
                  onChange={(v) => handlePhoneChange("repMobile", v)}
                  hasError={!!errors.repMobile}
                />
                {errors.repMobile && <p className="text-xs text-[#FB2C36] mt-1">{errors.repMobile}</p>}
              </div>
              <div className="md:col-span-2">
                <Label>Email <span className="text-[#FB2C36]">*</span></Label>
                <input
                  type="email"
                  name="repEmail"
                  autoComplete="off"
                  value={formData.repEmail}
                  onChange={(e) => handleEmailChange("repEmail", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg outline-none ${errors.repEmail ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`}
                  placeholder="email@example.com"
                />
                {errors.repEmail && <p className="text-xs text-[#FB2C36] mt-1">{errors.repEmail}</p>}
              </div>
            </div>
          </Section>

          {/* Category of Members */}
          <Section title="Category of Members">
            <div className="space-y-3">
              {["generator", "manufacturer", "other"].map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-3 p-4 border border-[#e5e7eb] rounded-lg cursor-pointer hover:bg-[#f9fafb] transition-colors"
                >
                  <input
                    type="radio"
                    name="memberCategory"
                    value={cat}
                    checked={formData.memberCategory === cat}
                    onChange={(e) => setFormData({ ...formData, memberCategory: e.target.value })}
                    className="w-4 h-4 text-[#1F7A4D] focus:ring-[#1F7A4D]"
                  />
                  <span className="text-sm font-medium text-[#242424]">
                    {cat === "generator" && "Wind Electric Generator"}
                    {cat === "manufacturer" && "Manufacturer / Supplier"}
                    {cat === "other" && "Other"}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          {/* Wind Electric Generator Details (only if generator selected) */}
          {formData.memberCategory === "generator" && (
            <Section
              title="Wind Electric Generator Details"
              action={
                <button
                  onClick={addWindRow}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-[#ffffff] rounded-lg hover:bg-[#176939] transition-colors text-sm font-medium cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add More
                </button>
              }
            >

              <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
                <div className="overflow-x-auto -mx-0">
                  <table className="w-full min-w-175">
                    <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                      <tr>
                        <th className="text-left px-3 py-3 text-xs sm:text-sm font-medium whitespace-nowrap">Location</th>
                        <th className="text-left px-3 py-3 text-xs sm:text-sm font-medium whitespace-nowrap">No. of Wind Mills</th>
                        <th className="text-left px-3 py-3 text-xs sm:text-sm font-medium whitespace-nowrap">Rated Capacity</th>
                        <th className="text-left px-3 py-3 text-xs sm:text-sm font-medium whitespace-nowrap">Total MW</th>
                        <th className="text-left px-3 py-3 text-xs sm:text-sm font-medium whitespace-nowrap">Make</th>
                        <th className="text-left px-3 py-3 text-xs sm:text-sm font-medium whitespace-nowrap">Connected Substation</th>
                        <th className="text-center px-3 py-3 text-xs sm:text-sm font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e7eb]">
                      {windRows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.location}
                              onChange={(e) => updateWindRow(row.id, "location", e.target.value)}
                              className="w-full min-w-[100px] px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="Location"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.noOfWindMills}
                              onChange={(e) => updateWindRow(row.id, "noOfWindMills", e.target.value)}
                              className="w-full min-w-[60px] px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="No."
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.ratedCapacity}
                              onChange={(e) => updateWindRow(row.id, "ratedCapacity", e.target.value)}
                              className="w-full min-w-[80px] px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="Capacity"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.totalMW}
                              onChange={(e) => updateWindRow(row.id, "totalMW", e.target.value)}
                              className="w-full min-w-[60px] px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="MW"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.make}
                              onChange={(e) => updateWindRow(row.id, "make", e.target.value)}
                              className="w-full min-w-[80px] px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="Make"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.connectedSubstation}
                              onChange={(e) => updateWindRow(row.id, "connectedSubstation", e.target.value)}
                              className="w-full min-w-[100px] px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="Substation"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => removeWindRow(row.id)}
                              disabled={windRows.length === 1}
                              className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>
          )}

          {/* Additional Information */}
          <Section title="Additional Information">
            <div className="space-y-4">
              <div>
                <Label>Business Description</Label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Describe your business activities..."
                />
              </div>
              <div>
                <Label>Chairman / MD Details</Label>
                <input
                  type="text"
                  name="chairmanMD"
                  autoComplete="off"
                  value={formData.chairmanMD}
                  onChange={(e) => setFormData({ ...formData, chairmanMD: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Name and designation"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name <span className="text-[#FB2C36]">*</span></Label>
                  <input
                    type="text"
                    name="addRepName"
                    autoComplete="off"
                    value={formData.addRepName}
                    placeholder="Enter name"
                    onChange={(e) => setFormData({ ...formData, addRepName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  />
                </div>
                <div>
                  <Label>Designation <span className="text-[#FB2C36]">*</span></Label>
                  <input
                    type="text"
                    name="addRepDesignation"
                    autoComplete="off"
                    value={formData.addRepDesignation}
                    placeholder="Enter designation"
                    onChange={(e) => setFormData({ ...formData, addRepDesignation: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  />
                </div>
                <div>
                  <Label>Office Phone</Label>
                  <PhoneInput
                    name="addRepOfficePhone"
                    value={formData.addRepOfficePhone}
                    onChange={(v) => handlePhoneChange("addRepOfficePhone", v)}
                    hasError={!!errors.addRepOfficePhone}
                  />
                  {errors.addRepOfficePhone && <p className="text-xs text-[#FB2C36] mt-1">{errors.addRepOfficePhone}</p>}
                </div>
                <div>
                  <Label>Mobile <span className="text-[#FB2C36]">*</span></Label>
                  <PhoneInput
                    name="addRepMobile"
                    value={formData.addRepMobile}
                    onChange={(v) => handlePhoneChange("addRepMobile", v)}
                    hasError={!!errors.addRepMobile}
                  />
                  {errors.addRepMobile && <p className="text-xs text-[#FB2C36] mt-1">{errors.addRepMobile}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label>Email <span className="text-[#FB2C36]">*</span></Label>
                  <input
                    type="email"
                    name="addRepEmail"
                    autoComplete="off"
                    value={formData.addRepEmail}
                    onChange={(e) => handleEmailChange("addRepEmail", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg outline-none ${errors.addRepEmail ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`}
                    placeholder="email@example.com"
                  />
                  {errors.addRepEmail && <p className="text-xs text-[#FB2C36] mt-1">{errors.addRepEmail}</p>}
                </div>
              </div>
              <div>
                <Label>Group Company Details (if total capacity &gt; 38 MW)</Label>
                <textarea
                  value={formData.groupCompany}
                  onChange={(e) => setFormData({ ...formData, groupCompany: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Enter group company details if applicable"
                />
                <p className="text-xs text-[#6a7282] mt-1">
                  Adding group company details will append (G) to membership number
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-8 py-4 sm:py-6 border-t border-[#e5e7eb] bg-[#f9fafb]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-white transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2.5 border border-[#1F7A4D] text-[#1F7A4D] rounded-lg hover:bg-[#ecfdf5] transition-colors font-medium cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Helper components
   ------------------------------------------------------------------------- */
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#242424]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[#242424] mb-2">{children}</label>;
}