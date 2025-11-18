'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          className="text-4xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          تواصل معنا
        </motion.h1>

        <motion.p
          className="text-lg text-gray-700 leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          يسعدنا تواصلك معنا في أي وقت! إذا كان لديك اقتراحات، استفسارات، أو ترغب في التعاون معنا، 
          يمكنك مراسلتنا عبر الوسائل التالية:
        </motion.p>

        <motion.div
          className="bg-white shadow-md rounded-2xl p-8 inline-block text-left space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* البريد الإلكتروني */}
          <div className="flex items-center gap-3">
            <Mail className="text-blue-600" />
            <a
              href="mailto:chefalarabonline@gmail.com"
              className="text-blue-700 font-semibold hover:underline"
            >
              chefalarabonline@gmail.com
            </a>
          </div>

          {/* واتس آب */}
          <div className="flex items-center gap-3">
            <MessageCircle className="text-green-600" />
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 font-semibold hover:underline"
            >
              تواصل معنا عبر واتس آب
            </a>
          </div>

          {/* تلجرام */}
          <div className="flex items-center gap-3">
            <MessageCircle className="text-blue-400" />
            <a
              href="https://t.me/chefalarab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold hover:underline"
            >
              تواصل معنا عبر تلجرام
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
