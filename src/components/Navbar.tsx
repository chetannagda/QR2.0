import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <QrCode className="h-8 w-8 text-indigo-600 mr-2" />
            <span className="text-xl font-bold text-gray-800">QR Generator</span>
          </motion.div>
          
          <div className="flex space-x-4">
            <Link to="/">
              <motion.button
                className={`px-4 py-2 rounded-md transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-indigo-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Online QR
              </motion.button>
            </Link>
            
            <Link to="/offline">
              <motion.button
                className={`px-4 py-2 rounded-md transition-colors ${
                  location.pathname === '/offline' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-indigo-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Offline QR
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;