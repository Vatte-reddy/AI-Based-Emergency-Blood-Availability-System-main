import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, LayoutDashboard, HandHeart, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WelcomePage = ({ user }) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 90px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: '"Inter", "Poppins", sans-serif' }}>
      <motion.div 
        style={{ maxWidth: '900px', width: '100%' }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '20px' }}>
            <Heart size={40} />
          </div>
          <h1 style={{ fontSize: '32px', color: '#f8fafc', marginBottom: '16px', fontWeight: 'bold' }}>
            Welcome to BloodHub, {user?.name || 'Member'}
          </h1>
          <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Our intelligent blood allocation system bridges the gap between generous donors and patients in critical need. 
            Select how you would like to interact with the community today.
          </p>
        </motion.div>

        <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid rgba(255, 255, 255, 0.05)' }}
            onClick={() => navigate('/donate')}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', marginBottom: '20px' }}>
              <HandHeart size={32} />
            </div>
            <h3 style={{ fontSize: '20px', color: '#f8fafc', marginBottom: '12px' }}>Donate Blood</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>Register as a voluntary donor exactly where you are to save lives nearby.</p>
            <button style={{ backgroundColor: 'transparent', color: '#22c55e', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
              Proceed <PlusCircle size={16} />
            </button>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid rgba(239, 68, 68, 0.1)' }}
            onClick={() => navigate('/request')}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '20px' }}>
              <Activity size={32} />
            </div>
            <h3 style={{ fontSize: '20px', color: '#f8fafc', marginBottom: '12px' }}>Request Blood</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>Post an emergency requirement and match with compatible donors dynamically.</p>
            <button style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
              Proceed <PlusCircle size={16} />
            </button>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid rgba(255, 255, 255, 0.05)' }}
            onClick={() => navigate('/dashboard')}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', marginBottom: '20px' }}>
              <LayoutDashboard size={32} />
            </div>
            <h3 style={{ fontSize: '20px', color: '#f8fafc', marginBottom: '12px' }}>View Dashboard</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>Access administrator stats, active tracking, machine learning models and more.</p>
            <button style={{ backgroundColor: 'transparent', color: '#3b82f6', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
              Proceed <PlusCircle size={16} />
            </button>
          </motion.div>



        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
