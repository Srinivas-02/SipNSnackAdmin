import logo from '../assets/Logo.png'
import {useNavigate} from 'react-router'
import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios'
import useAccountStore from '../store/account'

const Login = () => {
    const name = useAccountStore((state) => state.name)
    const setUserInfo = useAccountStore((state) => state.setDetails)
    const navigate = useNavigate()
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleLogin = () => {
        // Simple validation
        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        axios.post('/accounts/login/', {
            login_type: 'user',
            email,
            password
        })
        .then(response => {
            // Pass the entire response to the store
            console.log(response)
            if(response.data.user.is_staff){
                setError(
                    'Login failed. Staff has no access.'
                );
                return
            }
            setUserInfo(response);
            console.log('User authenticated:', name);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
            navigate('/dashboard');
        })
        .catch(error => {
            console.error('Login error:', error);
            setError(
                error.response?.data?.message || 
                'Login failed. Please check your credentials and try again.'
            );
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    return(
        <div className="w-full h-screen flex flex-col lg:flex-row bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
            {/* Left side with logo - responsive: full width on small screens, half on large */}
            <motion.div 
                className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 md:p-8 py-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div
                    className="relative mb-16 md:mb-20"
                    animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                    <motion.img 
                        src={logo} 
                        className="w-full mx-auto aspect-1 drop-shadow-xl" 
                        alt="Sip N Snack Logo" 
                        style={{ 
                            maxWidth: 'min(400px, 90vw)',
                            filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.1))'
                        }}
                        whileHover={{ scale: 1.05 }}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6 }}
                    />
                    <motion.div
                        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <p className="text-amber-700 italic text-base md:text-lg">Savor every moment</p>
                    </motion.div>
                </motion.div>
            </motion.div>
            
            {/* Right side with login form - responsive padding/sizing */}
            <div className="flex-1 flex items-center p-4 md:p-8 lg:p-12 ">
                <motion.div 
                    className="w-[80%] max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8 "
                    style={{ 
                        boxShadow: 'var(--shadow-xl)',
                        borderRadius: 'var(--border-radius-lg)'
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <h2 className="text-2xl font-bold mb-2" 
                            style={{ color: 'var(--color-primary-dark)' }}>Welcome Back</h2>
                        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>Sign in to your dashboard</p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                    >
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium mb-1" 
                                   style={{ color: 'var(--color-text-primary)' }}>email</label>
                            <input 
                                id="email"
                                type="text" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='Enter your email' 
                                className="w-full p-3 border rounded-lg transition-all" 
                                style={{ 
                                    borderColor: 'var(--color-border)',
                                    borderRadius: 'var(--border-radius-md)',
                                }}
                            />
                        </div>
                        
                        <div className="relative mb-6">
                            <label htmlFor="password" className="block text-sm font-medium mb-1"
                                   style={{ color: 'var(--color-text-primary)' }}>Password</label>
                            <div className="relative">
                                <input 
                                    id="password"
                                    type={passwordVisible ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password" 
                                    className="w-full p-3 border rounded-lg transition-all" 
                                    style={{ 
                                        borderColor: 'var(--color-border)',
                                        borderRadius: 'var(--border-radius-md)',
                                    }}
                                />
                                <button 
                                    type="button" 
                                    onClick={togglePasswordVisibility} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors"
                                >
                                    {passwordVisible ? 
                                        <span className="flex items-center text-sm">Hide</span> : 
                                        <span className="flex items-center text-sm">Show</span>
                                    }
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-6">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 border-gray-300 rounded"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                    style={{ accentColor: 'var(--color-primary)' }}
                                />
                                <span className="ml-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Remember me</span>
                            </label>
                            <p className="text-sm hover:underline cursor-pointer transition-colors"
                               style={{ color: 'var(--color-primary)' }}>Forgot password?</p>
                        </div>
                        
                        <motion.button 
                            type="submit"
                            className="w-full py-3 px-4 rounded-lg font-medium shadow-md transition-all duration-300 brand-gradient text-white"
                            style={{ 
                                backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                                borderRadius: 'var(--border-radius-md)',
                            }}
                            whileHover={{ scale: 1.02, boxShadow: 'var(--shadow-lg)' }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </motion.button>
                    </motion.form>
                    
                    {error && (
                        <motion.div 
                            className="mt-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {error}
                        </motion.div>
                    )}
                    
                    <motion.div 
                        className="mt-6 text-center text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        Need access? <span className="hover:underline cursor-pointer"
                                         style={{ color: 'var(--color-primary)' }}>Contact administrator</span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}
export default Login