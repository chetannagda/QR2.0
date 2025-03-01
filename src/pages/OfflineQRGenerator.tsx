import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';
import { Download, Image, User, Phone, MapPin, RefreshCw, Check, Info } from 'lucide-react';

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  company: string;
  title: string;
  website: string;
  notes: string;
}

const OfflineQRGenerator: React.FC = () => {
  const initialContactInfo: ContactInfo = {
    name: '',
    phone: '',
    email: '',
    address: '',
    company: '',
    title: '',
    website: '',
    notes: ''
  };
  
  const [contactInfo, setContactInfo] = useState<ContactInfo>(initialContactInfo);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [fgColor, setFgColor] = useState('#000000');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showFgPicker, setShowFgPicker] = useState(false);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isGenerated) {
      const timer = setTimeout(() => {
        setIsGenerated(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isGenerated]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const removeLogo = () => {
    setLogoImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const generateVCardData = (): string => {
    const { name, phone, email, address, company, title, website, notes } = contactInfo;
    
    let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
    
    if (name) vcard += `FN:${name}\n`;
    if (name) vcard += `N:${name};;;\n`;
    if (phone) vcard += `TEL;TYPE=CELL:${phone}\n`;
    if (email) vcard += `EMAIL:${email}\n`;
    if (address) vcard += `ADR;TYPE=HOME:;;${address};;;\n`;
    if (company) vcard += `ORG:${company}\n`;
    if (title) vcard += `TITLE:${title}\n`;
    if (website) vcard += `URL:${website}\n`;
    if (notes) vcard += `NOTE:${notes}\n`;
    
    vcard += 'END:VCARD';
    
    return vcard;
  };
  
  const generateQRCode = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1000);
  };
  
  const downloadQRCode = (format: 'png' | 'svg') => {
    if (!qrRef.current) return;
    
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    
    if (format === 'png') {
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, 'contact-qrcode.png');
        }
      });
    } else if (format === 'svg') {
      // Create SVG from canvas
      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              <img src="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}" />
            </div>
          </foreignObject>
        </svg>
      `;
      
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      saveAs(blob, 'contact-qrcode.svg');
    }
    
    setShowDownloadOptions(false);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Offline Contact QR Generator</h1>
        <p className="text-gray-600">Create QR codes for contact information that works without internet</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="mb-6">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 ${activeTab === 'basic' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('basic')}
              >
                Basic Info
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'additional' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('additional')}
              >
                Additional Info
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'appearance' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('appearance')}
              >
                Appearance
              </button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactInfo.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactInfo.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={contactInfo.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="123 Main St, City, Country"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'additional' && (
              <motion.div
                key="additional"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={contactInfo.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Company Name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={contactInfo.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Software Developer"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={contactInfo.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={contactInfo.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Additional information..."
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">QR Code Colors</h3>
                    
                    <div className="flex flex-col space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Background Color
                          </label>
                          <div 
                            className="w-8 h-8 rounded-md cursor-pointer border border-gray-300"
                            style={{ backgroundColor: bgColor }}
                            onClick={() => setShowBgPicker(!showBgPicker)}
                          />
                        </div>
                        
                        {showBgPicker && (
                          <div className="relative z-10">
                            <div 
                              className="fixed inset-0" 
                              onClick={() => setShowBgPicker(false)}
                            />
                            <div className="absolute right-0">
                              <HexColorPicker color={bgColor} onChange={setBgColor} />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            QR Code Color
                          </label>
                          <div 
                            className="w-8 h-8 rounded-md cursor-pointer border border-gray-300"
                            style={{ backgroundColor: fgColor }}
                            onClick={() => setShowFgPicker(!showFgPicker)}
                          />
                        </div>
                        
                        {showFgPicker && (
                          <div className="relative z-10">
                            <div 
                              className="fixed inset-0" 
                              onClick={() => setShowFgPicker(false)}
                            />
                            <div className="absolute right-0">
                              <HexColorPicker color={fgColor} onChange={setFgColor} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Add Logo (Optional)</h3>
                    
                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md flex items-center"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Image size={18} className="mr-2" />
                        Choose Logo
                      </motion.button>
                      
                      {logoImage && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-md"
                          onClick={removeLogo}
                        >
                          Remove
                        </motion.button>
                      )}
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    
                    {logoImage && (
                      <div className="mt-3 flex justify-center">
                        <img 
                          src={logoImage} 
                          alt="Logo Preview" 
                          className="h-16 w-16 object-contain border border-gray-300 rounded-md p-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-indigo-600 text-white rounded-md font-medium flex items-center justify-center"
              onClick={generateQRCode}
              disabled={isGenerating || !contactInfo.name || !contactInfo.phone}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 animate-spin" size={20} />
                  Generating...
                </>
              ) : isGenerated ? (
                <>
                  <Check className="mr-2" size={20} />
                  Generated!
                </>
              ) : (
                'Generate Contact QR Code'
              )}
            </motion.button>
            
            {(!contactInfo.name || !contactInfo.phone) && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <Info size={16} className="mr-1" />
                Name and phone number are required
              </p>
            )}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center"
        >
          <h2 className="text-xl font-semibold mb-6">Your Contact QR Code</h2>
          
          <div 
            ref={qrRef}
            className="p-4 rounded-lg"
            style={{ backgroundColor: bgColor }}
          >
            <QRCodeCanvas
              value={generateVCardData()}
              size={200}
              bgColor={bgColor}
              fgColor={fgColor}
              level="H"
              imageSettings={
                logoImage
                  ? {
                      src: logoImage,
                      excavate: true,
                      width: 40,
                      height: 40,
                    }
                  : undefined
              }
            />
          </div>
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <User size={16} className="text-gray-600" />
              <p className="text-gray-800 font-medium">{contactInfo.name || 'Your Name'}</p>
            </div>
            
            {contactInfo.phone && (
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Phone size={16} className="text-gray-600" />
                <p className="text-gray-800">{contactInfo.phone}</p>
              </div>
            )}
            
            {contactInfo.address && (
              <div className="flex items-center justify-center space-x-2 mb-1">
                <MapPin size={16} className="text-gray-600" />
                <p className="text-gray-800">{contactInfo.address}</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-green-600 text-white rounded-md font-medium flex items-center"
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              disabled={!contactInfo.name || !contactInfo.phone}
            >
              <Download className="mr-2" size={20} />
              Download QR Code
            </motion.button>
            
            <AnimatePresence>
              {showDownloadOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute mt-2 w-full bg-white rounded-md shadow-lg z-10 overflow-hidden"
                >
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                    onClick={() => downloadQRCode('png')}
                  >
                    Download as PNG
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                    onClick={() => downloadQRCode('svg')}
                  >
                    Download as SVG
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>When scanned, this QR code will allow users to add your contact information directly to their phone's address book.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OfflineQRGenerator;