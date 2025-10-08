import React from "react";

function App() {
  // Custom SVG Diagram Components
  const Diagram1 = () => (
    <div className="flex justify-center items-center p-6 diagram-container">
      <svg width="800" height="600" className="bg-white rounded-lg shadow-lg">
        {/* Main Process Flow - Vertical Layout */}

        {/* User */}
        <rect
          x="350"
          y="20"
          width="100"
          height="60"
          rx="10"
          fill="#e3f2fd"
          stroke="#1976d2"
          strokeWidth="2"
        />
        <text
          x="400"
          y="55"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          👤 المستخدم
        </text>

        {/* Arrow down */}
        <path
          d="M400 80 L400 110"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />

        {/* Send Report */}
        <rect
          x="350"
          y="110"
          width="100"
          height="60"
          rx="10"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />
        <text
          x="400"
          y="140"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          📝 إرسال بلاغ
        </text>

        {/* Arrow down */}
        <path
          d="M400 170 L400 200"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />

        {/* Admin Review */}
        <rect
          x="350"
          y="200"
          width="115"
          height="60"
          rx="10"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="2"
        />
        <text
          x="407.5"
          y="230"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          👨‍💼 مراجعة الإدارة
        </text>

        {/* Arrow down */}
        <path
          d="M400 260 L400 290"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />

        {/* Decision Diamond */}
        <polygon
          points="400,290 460,330 400,370 340,330"
          fill="#f3e5f5"
          stroke="#9c27b0"
          strokeWidth="2"
        />

        <text
          x="400"
          y="330"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          🔍 فحص الإشاعة
        </text>

        {/* False Rumor Path (Left) */}
        <path
          d="M340 330 L250 330"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        <text
          x="295"
          y="320"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#4caf50"
        >
          ✅ إشاعة كاذبة
        </text>

        <rect
          x="150" /* moved a bit more left */
          y="305"
          width="100"
          height="60"
          rx="10"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />

        <text
          x="200" /* center of the rectangle */
          y="335"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          📢 إشعار الأعضاء
        </text>

        {/* Arrow down from first rectangle */}
        <path
          d="M200 365 L200 395" /* from bottom center of first rectangle */
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />

        {/* Second rectangle below the first */}
        <rect
          x="150" /* same X as first rectangle */
          y="395" /* placed below arrow */
          width="100"
          height="60"
          rx="10"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />

        {/* Text inside second rectangle */}
        <text
          x="200" /* center of rectangle */
          y="425" /* vertical center */
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          💬 ردود الأعضاء
        </text>

        {/* Arrow down from second rectangle */}
        <path
          d="M200 455 L200 485" /* from bottom center of second rectangle */
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />

        {/* Third rectangle below the second */}
        <rect
          x="150" /* same X for alignment */
          y="485" /* placed below arrow */
          width="100"
          height="60"
          rx="10"
          fill="#fff9c4"
          stroke="#fbc02d"
          strokeWidth="2"
        />

        {/* Text inside third rectangle */}
        <text
          x="200" /* center of rectangle */
          y="515" /* vertical center */
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          ⭐ حساب النقاط
        </text>

        {/* True Rumor Path (Right) */}
        <path
          d="M460 330 L560 330" /* arrow from right edge of diamond */
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />

        <text
          x="510"
          y="320" /* slightly above arrow */
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#f44336"
        >
          ❌ إشاعة صحيحة
        </text>

        {/* Rectangle for True Rumor */}
        <rect
          x="560" /* placed at the end of the arrow */
          y="305" /* aligned vertically with diamond center */
          width="100"
          height="60"
          rx="10"
          fill="#ffebee"
          stroke="#f44336"
          strokeWidth="2"
        />

        {/* Text inside rectangle */}
        <text
          x="610" /* center of rectangle */
          y="335" /* vertical center */
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          🚫 رفض البلاغ
        </text>

        {/* Arrow markers */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
      </svg>
    </div>
  );

  const Diagram2 = () => (
    <div className="flex justify-center items-center p-6 diagram-container">
      <svg width="900" height="400" className="bg-white rounded-lg shadow-lg">
        {/* User Types and Permissions */}

        {/* Visitor */}
        <rect
          x="350"
          y="20"
          width="100"
          height="60"
          rx="10"
          fill="#e3f2fd"
          stroke="#1976d2"
          strokeWidth="2"
        />
        <text
          x="400"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          🌐 زائر الموقع
        </text>

        {/* Arrow down to diamond */}
        <path
          d="M400 80 L400 110" /* moved arrow a bit down */
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead2)"
        />

        {/* Decision Diamond */}
        <polygon
          points="400,110 460,150 400,190 340,150" /* diamond moved down */
          fill="#f3e5f5"
          stroke="#9c27b0"
          strokeWidth="2"
        />
        <text
          x="400"
          y="150"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          نوع المستخدم
        </text>

        {/* Left Path: Regular User */}
        <path
          d="M340 150 L220 150" /* arrow starts further left from diamond */
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead2)"
        />
        <text
          x="280"
          y="140"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#4caf50"
        >
          مستخدم عادي
        </text>

        <rect
          x="95" /* moved more left */
          y="140"
          width="125"
          height="60"
          rx="10"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />
        <text
          x="158"
          y="170"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          👤 المستخدم العادي
        </text>

        {/* Left Permissions: moved more left */}
        <rect
          x="0" /* moved more left */
          y="220"
          width="110"
          height="50"
          rx="8"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="1"
        />
        <text
          x="60"
          y="245"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          📝 إرسال بلاغات
        </text>

        <rect
          x="120" /* moved more left */
          y="220"
          width="125"
          height="50"
          rx="8"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="1"
        />
        <text
          x="185"
          y="245"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          💬 الرد على الإشاعات
        </text>

        <rect
          x="255" /* moved more left */
          y="220"
          width="145"
          height="50"
          rx="8"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="1"
        />
        <text
          x="330"
          y="245"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          👤 عرض الملف الشخصي
        </text>

        <rect
          x="410" /* moved more left */
          y="220"
          width="120"
          height="50"
          rx="8"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="1"
        />
        <text
          x="470"
          y="245"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          🔔 عرض الإشعارات
        </text>

        {/* Right Path: Admin */}
        <path
          d="M460 150 L530 150" /* arrow moved further left */
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead2)"
        />
        <text
          x="495"
          y="140"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#ff9800"
        >
          إدارة
        </text>

        <rect
          x="550" /* main Admin box moved more left */
          y="140"
          width="100"
          height="60"
          rx="10"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="2"
        />
        <text
          x="600"
          y="170"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          👨‍💼 الإدارة
        </text>

        {/* Right Permissions */}
        <rect
          x="550" /* moved more left */
          y="220"
          width="110"
          height="50"
          rx="8"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="605"
          y="245"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          🔍 مراجعة البلاغات
        </text>

        <rect
          x="670" /* moved more left */
          y="220"
          width="100"
          height="50"
          rx="8"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="720"
          y="245"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          ✍️ كتابة الردود
        </text>

        <rect
          x="550" /* moved more left */
          y="290"
          width="120"
          height="50"
          rx="8"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="610"
          y="315"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          📊 عرض الإحصائيات
        </text>

        <rect
          x="680" /* moved more left */
          y="290"
          width="110"
          height="50"
          rx="8"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="730"
          y="315"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          👥 إدارة الأعضاء
        </text>

        {/* Arrow markers */}
        <defs>
          <marker
            id="arrowhead2"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
      </svg>
    </div>
  );

  const Diagram3 = () => (
    <div className="flex justify-center items-center p-6 diagram-container">
      <svg width="900" height="600" className="bg-white rounded-lg shadow-lg">
        {/* Security System */}

        {/* Main Security Box */}
        <rect
          x="50"
          y="50"
          width="800"
          height="500"
          rx="15"
          fill="#f8f9fa"
          stroke="#6c757d"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <text
          x="450"
          y="80"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#000"
        >
          🛡️ نظام الأمان والصلاحيات
        </text>

        {/* Security Features */}
        <rect
          x="100"
          y="120"
          width="150"
          height="80"
          rx="10"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />
        <text
          x="175"
          y="150"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          🔐 تشفير كلمات المرور
        </text>

        <rect
          x="280"
          y="120"
          width="150"
          height="80"
          rx="10"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />
        <text
          x="355"
          y="150"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          🔑 جلسات آمنة
        </text>

        <rect
          x="460"
          y="120"
          width="150"
          height="80"
          rx="10"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />
        <text
          x="535"
          y="150"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          🛡️ حماية من CSRF
        </text>

        <rect
          x="640"
          y="120"
          width="150"
          height="80"
          rx="10"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />
        <text
          x="715"
          y="150"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          📝 تسجيل العمليات
        </text>

        {/* User Types Section */}
        <rect
          x="100"
          y="250"
          width="300"
          height="200"
          rx="10"
          fill="#e3f2fd"
          stroke="#1976d2"
          strokeWidth="2"
        />
        <text
          x="250"
          y="280"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#000"
        >
          أنواع المستخدمين
        </text>

        <rect
          x="120"
          y="300"
          width="120"
          height="60"
          rx="8"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="1"
        />
        <text
          x="180"
          y="335"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          👤 المستخدم العادي
        </text>

        <rect
          x="260"
          y="300"
          width="120"
          height="60"
          rx="8"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="320"
          y="335"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          👨‍💼 الإدارة
        </text>

        {/* Permissions Grid */}
        <rect
          x="120"
          y="380"
          width="60"
          height="50"
          rx="5"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="1"
        />
        <text
          x="150"
          y="405"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fill="#000"
        >
          📝 بلاغات
        </text>

        <rect
          x="190"
          y="380"
          width="60"
          height="50"
          rx="5"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="1"
        />
        <text
          x="220"
          y="405"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fill="#000"
        >
          💬 ردود
        </text>

        <rect
          x="260"
          y="380"
          width="60"
          height="50"
          rx="5"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="290"
          y="405"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fill="#000"
        >
          🔍 مراجعة
        </text>

        <rect
          x="330"
          y="380"
          width="60"
          height="50"
          rx="5"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="360"
          y="405"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fill="#000"
        >
          📊 إحصائيات
        </text>

        {/* Admin Panel Section */}
        <rect
          x="450"
          y="250"
          width="300"
          height="200"
          rx="10"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="2"
        />
        <text
          x="600"
          y="280"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#000"
        >
          لوحة تحكم الإدارة
        </text>

        <rect
          x="470"
          y="300"
          width="100"
          height="60"
          rx="8"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="520"
          y="335"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fill="#000"
        >
          📋 مراجعة البلاغات
        </text>

        <rect
          x="590"
          y="300"
          width="100"
          height="60"
          rx="8"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="640"
          y="335"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          ✍️ كتابة الردود
        </text>

        <rect
          x="470"
          y="380"
          width="100"
          height="60"
          rx="8"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="520"
          y="415"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fill="#000"
        >
          📊 عرض الإحصائيات
        </text>

        <rect
          x="590"
          y="380"
          width="100"
          height="60"
          rx="8"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="640"
          y="415"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fill="#000"
        >
          👥 إدارة الأعضاء
        </text>
      </svg>
    </div>
  );

  const Diagram4 = () => (
    <div className="flex justify-center items-center p-6 diagram-container">
      <svg width="800" height="450" className="bg-white rounded-lg shadow-lg">
        {/* Points Flow */}
        <rect
          x="350"
          y="50" /* moved up from 100 → 50 */
          width="100"
          height="60"
          rx="10"
          fill="#e3f2fd"
          stroke="#1976d2"
          strokeWidth="2"
        />
        <text
          x="400"
          y="85" /* moved up from 135 → 85 */
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          📢 إشعار الإدارة
        </text>

        <path
          d="M400 110 L400 150" /* arrow adjusted */
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead4)"
        />

        <rect
          x="340"
          y="150" /* "⏰ بدء العد التنازلي" rectangle moved up */
          width="120"
          height="70"
          rx="10"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />
        <text
          x="400"
          y="185"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          ⏰ بدء العد التنازلي
        </text>

        {/* Points Levels */}
        <rect
          x="180"
          y="250" /* moved up from 300 → 250 */
          width="140"
          height="60"
          rx="8"
          fill="#ffebee"
          stroke="#f44336"
          strokeWidth="2"
        />
        <text
          x="250"
          y="285"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          🥇 أول عضو: 100 نقطة
        </text>

        <rect
          x="340"
          y="250"
          width="140"
          height="60"
          rx="8"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="2"
        />
        <text
          x="410"
          y="285"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          🥈 ثاني عضو: 80 نقطة
        </text>

        <rect
          x="500"
          y="250"
          width="140"
          height="60"
          rx="8"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />
        <text
          x="570"
          y="285"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          🥉 ثالث عضو: 60 نقطة
        </text>

        <rect
          x="180"
          y="330" /* moved up from 380 → 330 */
          width="140"
          height="60"
          rx="8"
          fill="#e3f2fd"
          stroke="#1976d2"
          strokeWidth="2"
        />
        <text
          x="250"
          y="365"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          🏅 رابع عضو: 40 نقطة
        </text>

        <rect
          x="340"
          y="330"
          width="140"
          height="60"
          rx="8"
          fill="#f3e5f5"
          stroke="#9c27b0"
          strokeWidth="2"
        />
        <text
          x="410"
          y="365"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          🏅 خامس عضو: 20 نقطة
        </text>

        <rect
          x="500"
          y="330"
          width="140"
          height="60"
          rx="8"
          fill="#e0f2f1"
          stroke="#009688"
          strokeWidth="2"
        />
        <text
          x="570"
          y="365"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          👥 بقية الأعضاء: 10 نقاط
        </text>

        {/* Arrow markers */}
        <defs>
          <marker
            id="arrowhead4"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
      </svg>
    </div>
  );

  const Diagram5 = () => (
    <div className="flex justify-center items-center p-6 diagram-container">
      <svg width="900" height="600" className="bg-white rounded-lg shadow-lg">
        {/* Database Structure */}

        {/* Header */}
        <rect
          x="50"
          y="20"
          width="800"
          height="60"
          rx="10"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />
        <text
          x="450"
          y="55"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#000"
        >
          🏗️ هيكل قاعدة البيانات
        </text>

        {/* USERS Table */}
        <rect
          x="100"
          y="120"
          width="150"
          height="200"
          rx="8"
          fill="#e3f2fd"
          stroke="#1976d2"
          strokeWidth="2"
        />
        <text
          x="175"
          y="135"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          USERS
        </text>
        {[
          "user_id (PK)",
          "username",
          "email",
          "total_points",
          "created_at",
          "updated_at",
          "status",
        ].map((line, i) => (
          <text
            key={i}
            x="175"
            y={160 + i * 20}
            textAnchor="middle"
            fontSize="12"
            dominantBaseline="hanging"
            fill="#000"
          >
            • {line}
          </text>
        ))}

        {/* REPORTS Table */}
        <rect
          x="300"
          y="120"
          width="150"
          height="200"
          rx="8"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="2"
        />
        <text
          x="375"
          y="135"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          REPORTS
        </text>
        {[
          "report_id (PK)",
          "user_id (FK)",
          "rumor_url",
          "rumor_image",
          "status",
          "created_at",
          "reviewed_at",
        ].map((line, i) => (
          <text
            key={i}
            x="375"
            y={160 + i * 20}
            textAnchor="middle"
            fontSize="12"
            dominantBaseline="hanging"
            fill="#000"
          >
            • {line}
          </text>
        ))}

        {/* ADMIN_RESPONSES Table */}
        <rect
          x="500"
          y="120"
          width="150"
          height="200"
          rx="8"
          fill="#f3e5f5"
          stroke="#9c27b0"
          strokeWidth="2"
        />
        <text
          x="575"
          y="135"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          ADMIN_RESPONSES
        </text>
        {[
          "response_id (PK)",
          "report_id (FK)",
          "response_text",
          "admin_id",
          "created_at",
          "updated_at",
          "is_published",
        ].map((line, i) => (
          <text
            key={i}
            x="575"
            y={160 + i * 20}
            textAnchor="middle"
            fontSize="12"
            dominantBaseline="hanging"
            fill="#000"
          >
            • {line}
          </text>
        ))}

        {/* USER_RESPONSES Table */}
        <rect
          x="100"
          y="360"
          width="150"
          height="200"
          rx="8"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />
        <text
          x="175"
          y="375"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          USER_RESPONSES
        </text>
        {[
          "response_id (PK)",
          "admin_response_id (FK)",
          "user_id (FK)",
          "response_text",
          "points_earned",
          "created_at",
          "response_order",
        ].map((line, i) => (
          <text
            key={i}
            x="175"
            y={400 + i * 20}
            textAnchor="middle"
            fontSize="12"
            dominantBaseline="hanging"
            fill="#000"
          >
            • {line}
          </text>
        ))}

        {/* NOTIFICATIONS Table */}
        <rect
          x="300"
          y="360"
          width="150"
          height="200"
          rx="8"
          fill="#ffebee"
          stroke="#f44336"
          strokeWidth="2"
        />
        <text
          x="375"
          y="375"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          NOTIFICATIONS
        </text>
        {[
          "notification_id (PK)",
          "user_id (FK)",
          "message",
          "type",
          "is_read",
          "created_at",
          "read_at",
        ].map((line, i) => (
          <text
            key={i}
            x="375"
            y={400 + i * 20}
            textAnchor="middle"
            fontSize="12"
            dominantBaseline="hanging"
            fill="#000"
          >
            • {line}
          </text>
        ))}

        {/* Relationships */}
        <path
          d="M250 220 L300 220"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead5)"
        />
        <text x="275" y="215" textAnchor="middle" fontSize="10" fill="#666">
          1:N
        </text>

        <path
          d="M450 220 L500 220"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead5)"
        />
        <text x="475" y="215" textAnchor="middle" fontSize="10" fill="#666">
          1:N
        </text>

        <path
          d="M250 460 L300 460"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead5)"
        />
        <text x="275" y="455" textAnchor="middle" fontSize="10" fill="#666">
          1:N
        </text>

        <path
          d="M250 460 L300 360"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead5)"
        />
        <text x="275" y="410" textAnchor="middle" fontSize="10" fill="#666">
          1:N
        </text>

        {/* Arrow markers */}
        <defs>
          <marker
            id="arrowhead5"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
      </svg>
    </div>
  );

  const Diagram6 = () => (
    <div className="flex justify-center items-center p-6 diagram-container">
      <svg width="900" height="500" className="bg-white rounded-lg shadow-lg">
        {/* Website Pages */}

        {/* Header */}
        <rect
          x="50"
          y="20"
          width="800"
          height="60"
          rx="10"
          fill="#e3f2fd"
          stroke="#1976d2"
          strokeWidth="2"
        />
        <text
          x="450"
          y="55"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#000"
        >
          📱 صفحات الموقع الرئيسية
        </text>

        {/* Main Page */}
        <rect
          x="350"
          y="120"
          width="200"
          height="80"
          rx="10"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="2"
        />
        <text
          x="450"
          y="165"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#000"
        >
          🏠 الصفحة الرئيسية
        </text>

        {/* User Pages */}
        <rect
          x="100"
          y="240"
          width="150"
          height="60"
          rx="8"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="1"
        />
        <text
          x="175"
          y="275"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          📝 صفحة الإبلاغ
        </text>

        <rect
          x="270"
          y="240"
          width="150"
          height="60"
          rx="8"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="1"
        />
        <text
          x="345"
          y="275"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          👤 صفحة الملف الشخصي
        </text>

        <rect
          x="440"
          y="240"
          width="150"
          height="60"
          rx="8"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="1"
        />
        <text
          x="515"
          y="275"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          🔔 صفحة الإشعارات
        </text>

        <rect
          x="610"
          y="240"
          width="150"
          height="60"
          rx="8"
          fill="#e8f5e8"
          stroke="#4caf50"
          strokeWidth="1"
        />
        <text
          x="685"
          y="275"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          📊 صفحة الإحصائيات
        </text>

        {/* Admin Section */}
        <rect
          x="100"
          y="340"
          width="200"
          height="80"
          rx="10"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="2"
        />
        <text
          x="200"
          y="385"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#000"
        >
          👨‍💼 تسجيل دخول الإدارة
        </text>

        <rect
          x="350"
          y="340"
          width="200"
          height="80"
          rx="10"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="2"
        />
        <text
          x="450"
          y="385"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#000"
        >
          🎛️ لوحة تحكم الإدارة
        </text>

        {/* Admin Sub-pages */}
        <rect
          x="600"
          y="340"
          width="120"
          height="50"
          rx="6"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="660"
          y="370"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          📋 مراجعة البلاغات
        </text>

        <rect
          x="600"
          y="400"
          width="120"
          height="50"
          rx="6"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="660"
          y="430"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          📊 الإحصائيات العامة
        </text>

        <rect
          x="740"
          y="340"
          width="120"
          height="50"
          rx="6"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="800"
          y="370"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          👥 إدارة الأعضاء
        </text>

        <rect
          x="740"
          y="400"
          width="120"
          height="50"
          rx="6"
          fill="#fff3e0"
          stroke="#ff9800"
          strokeWidth="1"
        />
        <text
          x="800"
          y="430"
          textAnchor="middle"
          fontSize="15"
          fontWeight="bold"
          fill="#000"
        >
          ⭐ إدارة النقاط
        </text>

        {/* Report Form Details */}
        <rect
          x="50"
          y="120"
          width="280"
          height="100"
          rx="8"
          fill="#f3e5f5"
          stroke="#9c27b0"
          strokeWidth="1"
        />
        <text
          x="180"
          y="145"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#000"
        >
          📤 نموذج الإبلاغ
        </text>

        <rect
          x="55"
          y="160"
          width="85"
          height="40"
          rx="4"
          fill="#f3e5f5"
          stroke="#9c27b0"
          strokeWidth="1"
        />
        <text
          x="100"
          y="185"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          🔗 إدخال الرابط
        </text>

        <rect
          x="150"
          y="160"
          width="85"
          height="40"
          rx="4"
          fill="#f3e5f5"
          stroke="#9c27b0"
          strokeWidth="1"
        />
        <text
          x="195"
          y="185"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          📷 رفع الصورة
        </text>

        <rect
          x="240"
          y="160"
          width="85"
          height="40"
          rx="4"
          fill="#f3e5f5"
          stroke="#9c27b0"
          strokeWidth="1"
        />
        <text
          x="285"
          y="185"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
        >
          📝 وصف البلاغ
        </text>

        {/* Connections */}
        <path
          d="M450 200 L175 240"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead6)"
        />
        <path
          d="M450 200 L345 240"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead6)"
        />
        <path
          d="M450 200 L515 240"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead6)"
        />
        <path
          d="M450 200 L685 240"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead6)"
        />

        <path
          d="M200 420 L450 420"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead6)"
        />
        <path
          d="M450 420 L660 380"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead6)"
        />
        <path
          d="M450 420 L800 380"
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead6)"
        />

        {/* Arrow markers */}
        <defs>
          <marker
            id="arrowhead6"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
      </svg>
    </div>
  );

  const diagrams = [
    {
      id: "diagram1",
      title: "🔄 تدفق العملية الرئيسي",
      description:
        "يوضح هذا المخطط المسار الكامل لعملية التبليغ عن الإشاعات، من إرسال البلاغ من قبل المستخدم حتى حساب النقاط للأعضاء الذين يردون على الإشاعات الكاذبة.",
      component: Diagram1,
    },
    {
      id: "diagram2",
      title: "👥 أنواع المستخدمين والصلاحيات",
      description:
        "يوضح هذا المخطط أنواع المستخدمين المختلفين في المنصة والصلاحيات المخصصة لكل نوع، بدءاً من الزائر العادي وصولاً إلى الإدارة مع جميع الصلاحيات المتاحة.",
      component: Diagram2,
    },
    {
      id: "diagram3",
      title: "🔒 نظام الأمان والصلاحيات",
      description:
        "يوضح هذا المخطط أنواع المستخدمين المختلفين في المنصة والصلاحيات المخصصة لكل نوع، بالإضافة إلى نظام الأمان المطبق لحماية البيانات والمستخدمين.",
      component: Diagram3,
    },
    {
      id: "diagram4",
      title: "⭐ نظام النقاط التفصيلي",
      description:
        "يحصل أول 5 أعضاء يردون على نقاط متدرجة (100، 80، 60، 40، 20 نقطة)، بينما يحصل بقية الأعضاء على 10 نقاط ثابتة لكل رد على الإشاعة.",
      component: Diagram4,
    },
    {
      id: "diagram5",
      title: "🏗️ هيكل قاعدة البيانات",
      description:
        "تظهر جميع الجداول والعلاقات بينها في النظام، بما في ذلك جداول المستخدمين، البلاغات، الردود، والإشعارات مع العلاقات المختلفة بينها.",
      component: Diagram5,
    },
    {
      id: "diagram6",
      title: "📱 صفحات الموقع الرئيسية",
      description:
        "يوضح هيكل الصفحات المختلفة في المنصة، بدءاً من الصفحة الرئيسية وصولاً إلى صفحات الإدارة المتخصصة مع جميع الوظائف المتاحة في كل صفحة.",
      component: Diagram6,
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-6">
              🏛️ المنصة الشعبية للتبليغ عن الإشاعات
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              منصة تفاعلية تسمح للمواطنين بالإبلاغ عن الإشاعات الكاذبة، حيث تقوم
              الإدارة بفحصها وإرسال إشعارات للأعضاء للرد عليها مع نظام نقاط
              متقدم يحفز المشاركة المجتمعية.
            </p>
          </div>
        </div>
      </div>

      {/* Diagrams Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8">
          {diagrams.map((diagram) => {
            const DiagramComponent = diagram.component;
            return (
              <div
                key={diagram.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <h2 className="text-3xl font-bold text-white">
                    {diagram.title}
                  </h2>
                </div>

                <div className="p-6">
                  <div className="bg-gray-50 rounded-xl border-2 border-blue-200 overflow-hidden">
                    <DiagramComponent />
                  </div>

                  <div className="mt-6 bg-blue-50 rounded-xl p-6 border-r-4 border-blue-500">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                      📋 وصف المخطط:
                    </h3>
                    <p className="text-blue-800 leading-relaxed">
                      {diagram.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">🎯 الهدف من المشروع</h2>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            إنشاء منصة تفاعلية تهدف إلى مكافحة الإشاعات الكاذبة من خلال مشاركة
            المجتمع في التصدي لها، مع نظام تحفيزي يعتمد على النقاط لضمان
            المشاركة الفعالة.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
