import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaHeart,
  FaGlobe,
} from "react-icons/fa";
import { AnimatedCard, GradientBackground } from "./Animations";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "الرئيسية", href: "/" },
      { name: "إرسال بلاغ", href: "/report" },
      { name: "الإشعارات", href: "/notifications" },
      { name: "الإحصائيات", href: "/statistics" },
    ],
    support: [
      { name: "مركز المساعدة", href: "/help" },
      { name: "اتصل بنا", href: "/contact" },
      { name: "الأسئلة الشائعة", href: "/faq" },
      { name: "الإبلاغ عن مشكلة", href: "/report-bug" },
    ],
    legal: [
      { name: "سياسة الخصوصية", href: "/privacy" },
      { name: "شروط الاستخدام", href: "/terms" },
      { name: "سياسة الإشاعات", href: "/rumor-policy" },
      { name: "إرشادات المجتمع", href: "/community-guidelines" },
    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebook,
      href: "#",
      color: "hover:text-blue-600",
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      href: "#",
      color: "hover:text-blue-400",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      href: "#",
      color: "hover:text-pink-600",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      href: "#",
      color: "hover:text-blue-700",
    },
  ];

  return (
    <footer
      className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">م</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">منصة منع الإشاعات</h3>
                <p className="text-sm text-gray-300">مجتمع مكافحة الإشاعات</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              منصة رائدة في مكافحة الإشاعات ونشر المعلومات الصحيحة. نساهم في
              بناء مجتمع واعٍ ومثقف.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center transition-colors ${social.color}`}
                  title={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Platform Links */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaGlobe className="w-5 h-5 text-blue-400" />
              المنصة
            </h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaShieldAlt className="w-5 h-5 text-green-400" />
              الدعم والمساعدة
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaShieldAlt className="w-5 h-5 text-purple-400" />
              القانونية
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="border-t border-white/20 pt-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FaEnvelope className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">البريد الإلكتروني</p>
                <p className="font-medium">info@mansa.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <FaPhone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">الهاتف</p>
                <p className="font-medium">+966 50 123 4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <FaMapMarkerAlt className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">العنوان</p>
                <p className="font-medium">الرياض، المملكة العربية السعودية</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border-t border-white/20 pt-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>
                © {currentYear} منصة منع الإشاعات. جميع الحقوق محفوظة.
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>صُنع بـ</span>
              <FaHeart className="w-4 h-4 text-red-500" />
              <span>في المملكة العربية السعودية</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

