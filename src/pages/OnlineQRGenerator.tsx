import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';
import { Download, Image, Link as LinkIcon, RefreshCw, Check } from 'lucide-react';

// Utility function to convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

// Utility function to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const OnlineQRGenerator: React.FC = () => {
  const [url, setUrl] = useState('https://example.com');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [fgColor, setFgColor] = useState('#000000');
  const [paddingColor, setPaddingColor] = useState('#FFFFFF');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showFgPicker, setShowFgPicker] = useState(false);
  const [showPaddingPicker, setShowPaddingPicker] = useState(false);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [qrSize, setQrSize] = useState(200);
  const [padding, setPadding] = useState(10);

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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
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
          saveAs(blob, 'qrcode.png');
        }
      });
    } else if (format === 'svg') {
      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width + padding * 2}" height="${canvas.height + padding * 2}">
          <rect width="100%" height="100%" fill="${paddingColor}" />
          <foreignObject x="${padding}" y="${padding}" width="${canvas.width}" height="${canvas.height}">
            <div xmlns="http://www.w3.org/1999/xhtml">
              <img src="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}" />
            </div>
          </foreignObject>
        </svg>
      `;

      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      saveAs(blob, 'qrcode.svg');
    }

    setShowDownloadOptions(false);
  };

  // Function to handle RGB input changes
  const handleRgbChange = (colorType: 'bg' | 'fg' | 'padding', value: { r?: number; g?: number; b?: number }) => {
    const currentHex = colorType === 'bg' ? bgColor : colorType === 'fg' ? fgColor : paddingColor;
    const currentRgb = hexToRgb(currentHex) || { r: 0, g: 0, b: 0 };

    const newRgb = {
      r: value.r !== undefined ? value.r : currentRgb.r,
      g: value.g !== undefined ? value.g : currentRgb.g,
      b: value.b !== undefined ? value.b : currentRgb.b,
    };

    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);

    if (colorType === 'bg') {
      setBgColor(newHex);
    } else if (colorType === 'fg') {
      setFgColor(newHex);
    } else if (colorType === 'padding') {
      setPaddingColor(newHex);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Online QR Code Generator</h1>
        <p className="text-gray-600">Generate QR codes for websites and links with custom colors and logo</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <LinkIcon className="mr-2 text-indigo-600" size={20} />
            Enter URL
          </h2>

          <div className="mb-6">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Website or Link
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={handleUrlChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Customize Colors</h3>

            <div className="flex flex-col space-y-4">
              {/* Background Color */}
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
                    <div className="absolute right-0 bg-white p-4 rounded-lg shadow-lg">
                      <HexColorPicker color={bgColor} onChange={setBgColor} />
                      <div className="mt-4 flex space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={hexToRgb(bgColor)?.r || 0}
                          onChange={(e) =>
                            handleRgbChange('bg', { r: parseInt(e.target.value) })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                          placeholder="R"
                        />
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={hexToRgb(bgColor)?.g || 0}
                          onChange={(e) =>
                            handleRgbChange('bg', { g: parseInt(e.target.value) })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                          placeholder="G"
                        />
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={hexToRgb(bgColor)?.b || 0}
                          onChange={(e) =>
                            handleRgbChange('bg', { b: parseInt(e.target.value) })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                          placeholder="B"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Color */}
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
                    <div className="absolute right-0 bg-white p-4 rounded-lg shadow-lg">
                      <HexColorPicker color={fgColor} onChange={setFgColor} />
                      <div className="mt-4 flex space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={hexToRgb(fgColor)?.r || 0}
                          onChange={(e) =>
                            handleRgbChange('fg', { r: parseInt(e.target.value) })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                          placeholder="R"
                        />
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={hexToRgb(fgColor)?.g || 0}
                          onChange={(e) =>
                            handleRgbChange('fg', { g: parseInt(e.target.value) })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                          placeholder="G"
                        />
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={hexToRgb(fgColor)?.b || 0}
                          onChange={(e) =>
                            handleRgbChange('fg', { b: parseInt(e.target.value) })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                          placeholder="B"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Padding Color */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Padding Color
                  </label>
                  <div
                    className="w-8 h-8 rounded-md cursor-pointer border border-gray-300"
                    style={{ backgroundColor: paddingColor }}
                    onClick={() => setShowPaddingPicker(!showPaddingPicker)}
                  />
                </div>

                {showPaddingPicker && (
                  <div className="relative z-10">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowPaddingPicker(false)}
                    />
                    <div className="absolute right-0 bg-white p-4 rounded-lg shadow-lg">
                      <HexColorPicker color={paddingColor} onChange={setPaddingColor} />
                      <div className="mt-4 flex space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={hexToRgb(paddingColor)?.r || 0}
                          onChange={(e) =>
                            handleRgbChange('padding', { r: parseInt(e.target.value) })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                          placeholder="R"
                        />
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={hexToRgb(paddingColor)?.g || 0}
                          onChange={(e) =>
                            handleRgbChange('padding', { g: parseInt(e.target.value) })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                          placeholder="G"
                        />
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={hexToRgb(paddingColor)?.b || 0}
                          onChange={(e) =>
                            handleRgbChange('padding', { b: parseInt(e.target.value) })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                          placeholder="B"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
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

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">QR Code Size</h3>
            <input
              type="range"
              min="100"
              max="500"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-1">{qrSize}x{qrSize} pixels</div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Padding</h3>
            <input
              type="range"
              min="0"
              max="50"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-1">{padding}px</div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-indigo-600 text-white rounded-md font-medium flex items-center justify-center"
            onClick={generateQRCode}
            disabled={isGenerating}
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
              'Generate QR Code'
            )}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center"
        >
          <h2 className="text-xl font-semibold mb-6">Your QR Code</h2>

          <div
            ref={qrRef}
            className="p-4 rounded-lg"
            style={{ backgroundColor: paddingColor, padding: `${padding}px` }}
          >
            <QRCodeCanvas
              value={url}
              size={qrSize}
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

          <div className="mt-8 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-green-600 text-white rounded-md font-medium flex items-center"
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
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
        </motion.div>
      </div>
    </div>
  );
};

export default OnlineQRGenerator;
