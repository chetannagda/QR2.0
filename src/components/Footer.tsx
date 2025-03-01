import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-center md:text-left">
              Created by <span className="font-bold">Chetan Nagda</span>
            </p>
          </div>
          
          <div className="flex space-x-4">
            <motion.a 
              href="https://www.instagram.com/chetan_nagda/" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="hover:text-pink-400 transition-colors"
            >
              <Instagram size={24} />
            </motion.a>
            
            <motion.a 
              href="https://www.linkedin.com/in/chetan-nagda/" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="hover:text-blue-400 transition-colors"
            >
              <Linkedin size={24} />
            </motion.a>
            
            <motion.a 
              href="https://github.com/chetan-nagda" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="hover:text-gray-400 transition-colors"
            >
              <Github size={24} />
            </motion.a>
          </div>
        </div>
        
        <div className="mt-4 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} QR Code Generator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;